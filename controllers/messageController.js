import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Gig from '../models/Gig.js';
import { sendNotificationToUser } from '../config/socket.js';

/**
 * @route   POST /api/messages/conversations
 * @desc    Start or get existing conversation
 * @access  Private
 */
export const startConversation = async (req, res, next) => {
  try {
    const { recipientId, gigId } = req.body;
    const senderId = req.user._id;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required'
      });
    }

    // Check if conversation already exists between these two users (optionally for specific gig)
    let query = {
      participants: { $all: [senderId, recipientId] }
    };

    if (gigId) {
      query.gigId = gigId;
    }

    let conversation = await Conversation.findOne(query);

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recipientId],
        gigId: gigId || null,
        updatedAt: new Date()
      });
    }

    // Populate participants and return
    await conversation.populate('participants', 'name email profileImage');
    if (conversation.gigId) {
      await conversation.populate('gigId', 'title');
    }

    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/messages/conversations
 * @desc    Get all conversations for current user
 * @access  Private
 */
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId
    })
      .populate('participants', 'name email profileImage role')
      .populate('gigId', 'title')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/messages/:conversationId
 * @desc    Get messages for a conversation
 * @access  Private
 */
export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or authorized'
      });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 });

    // Mark other's messages as read
    // This could be optimized to updateMany
    await Message.updateMany(
      { conversationId, senderId: { $ne: req.user._id }, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/messages
 * @desc    Send a message
 * @access  Private
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user._id;

    if (!conversationId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID and content are required'
      });
    }

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: senderId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Create message
    const message = await Message.create({
      conversationId,
      senderId,
      content
    });

    // Update conversation lastMessage and timestamp
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Send real-time message notification
    const recipientId = conversation.participants.find(
      (p) => p.toString() !== senderId.toString()
    );

    if (recipientId) {
      sendNotificationToUser(recipientId, 'new_message', {
        ...message.toObject(),
        senderName: req.user.name // Add sender name for frontend display
      });
    }

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
};
