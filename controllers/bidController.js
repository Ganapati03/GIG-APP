import mongoose from 'mongoose';
import Bid from '../models/Bid.js';
import Gig from '../models/Gig.js';
import User from '../models/User.js';
import { sendHireNotification } from '../config/socket.js';

/**
 * @route   POST /api/bids
 * @desc    Submit a bid for a gig
 * @access  Private
 */
export const createBid = async (req, res, next) => {
  try {
    const { gigId, message, price, deliveryTime } = req.body;

    // Check user role
    if (req.user.role === 'client') {
      return res.status(403).json({
        success: false,
        message: 'Only freelancers can submit bids'
      });
    }

    // Validation
    if (!gigId || !message || !price || !deliveryTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if gig exists and is open
    const gig = await Gig.findById(gigId);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This gig is no longer accepting bids'
      });
    }

    // Check if user is trying to bid on their own gig
    if (gig.ownerId.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot bid on your own gig'
      });
    }

    // Check if user already bid on this gig
    const existingBid = await Bid.findOne({
      gigId,
      freelancerId: req.user._id
    });

    if (existingBid) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a bid for this gig'
      });
    }

    // Create bid
    const bid = await Bid.create({
      gigId,
      freelancerId: req.user._id,
      message,
      price,
      deliveryTime
    });

    // Populate freelancer info
    await bid.populate('freelancerId', 'name email rating completedGigs');

    // Send real-time notification to gig owner
    sendNotificationToUser(gig.ownerId, 'new_bid', bid);

    res.status(201).json({
      success: true,
      message: 'Bid submitted successfully',
      bid
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/bids/:gigId
 * @desc    Get all bids for a gig (only gig owner)
 * @access  Private
 */
export const getBidsForGig = async (req, res, next) => {
  try {
    const { gigId } = req.params;

    // Check if gig exists
    const gig = await Gig.findById(gigId);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Check if user is the gig owner
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the gig owner can view bids'
      });
    }

    // Get all bids
    const bids = await Bid.find({ gigId })
      .populate('freelancerId', 'name email rating completedGigs skills')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bids.length,
      bids
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/bids/my/submitted
 * @desc    Get bids submitted by current user
 * @access  Private
 */
export const getMyBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user._id })
      .populate('gigId', 'title description budget status ownerId')
      .populate({
        path: 'gigId',
        populate: {
          path: 'ownerId',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bids.length,
      bids
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/bids/:bidId/hire
 * @desc    Hire a freelancer
 * @access  Private
 */
export const hireBid = async (req, res, next) => {
  try {
    const { bidId } = req.params;

    // Find bid
    const bid = await Bid.findById(bidId);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    // Find gig
    const gig = await Gig.findById(bid.gigId);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Authorization: Only gig owner can hire
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the gig owner can hire freelancers'
      });
    }

    // Check if gig is still open
    if (gig.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This gig has already been assigned'
      });
    }

    // 1. Update gig status to assigned
    gig.status = 'assigned';
    gig.hiredFreelancerId = bid.freelancerId;
    await gig.save();

    // 2. Update hired bid status
    bid.status = 'hired';
    await bid.save();

    // 3. Reject all other bids for this gig
    await Bid.updateMany(
      {
        gigId: gig._id,
        _id: { $ne: bidId },
        status: 'pending'
      },
      { status: 'rejected' }
    );

    // 4. Update freelancer's completed gigs count
    await User.findByIdAndUpdate(
      bid.freelancerId,
      { $inc: { completedGigs: 1 } }
    );

    // Send real-time notification to hired freelancer
    sendHireNotification(bid.freelancerId, gig.title, gig._id);

    // Populate for response
    await bid.populate('freelancerId', 'name email rating');
    await gig.populate('ownerId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Freelancer hired successfully',
      bid,
      gig
    });
  } catch (error) {
    next(error);
  }
};
