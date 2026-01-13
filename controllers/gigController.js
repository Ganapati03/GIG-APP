import Gig from '../models/Gig.js';
import { getIO } from '../config/socket.js';

/**
 * @route   GET /api/gigs
 * @desc    Get all open gigs (with optional search)
 * @access  Public
 */
export const getGigs = async (req, res, next) => {
  try {
    const { search, category, minBudget, maxBudget, sort } = req.query;

    // Build query
    const query = { status: 'open' };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Budget range filter
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }

    // Build sort
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'budget_asc') sortOption = { budget: 1 };
    if (sort === 'budget_desc') sortOption = { budget: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    // Execute query
    const gigs = await Gig.find(query)
      .populate('ownerId', 'name email rating')
      .sort(sortOption)
      .lean();

    res.status(200).json({
      success: true,
      count: gigs.length,
      gigs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/gigs/:id
 * @desc    Get single gig by ID
 * @access  Public
 */
export const getGigById = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('ownerId', 'name email rating completedGigs')
      .populate('hiredFreelancerId', 'name email rating');

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    res.status(200).json({
      success: true,
      gig
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/gigs
 * @desc    Create a new gig
 * @access  Private
 */
export const createGig = async (req, res, next) => {
  try {
    const { title, description, budget, category, deadline } = req.body;

    // Check user role
    if (req.user.role === 'freelancer') {
      return res.status(403).json({
        success: false,
        message: 'Only clients can post jobs'
      });
    }

    // Validation
    if (!title || !description || !budget) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and budget'
      });
    }

    // Create gig
    const gig = await Gig.create({
      title,
      description,
      budget,
      category: category || 'General',
      deadline: deadline || null,
      ownerId: req.user._id
    });

    // Populate owner info
    await gig.populate('ownerId', 'name email');

    // Broadcast new job to all connected users
    try {
      getIO().emit('new_job', gig);
    } catch (error) {
      console.error('Socket emit error:', error);
    }

    res.status(201).json({
      success: true,
      message: 'Gig created successfully',
      gig
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/gigs/my/posted
 * @desc    Get gigs posted by current user
 * @access  Private
 */
export const getMyPostedGigs = async (req, res, next) => {
  try {
    const gigs = await Gig.find({ ownerId: req.user._id })
      .populate('hiredFreelancerId', 'name email rating')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: gigs.length,
      gigs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/gigs/:id
 * @desc    Delete a gig (only owner can delete)
 * @access  Private
 */
export const deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Check ownership
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this gig'
      });
    }

    // Cannot delete if already assigned
    if (gig.status === 'assigned') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an assigned gig'
      });
    }

    await gig.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Gig deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
