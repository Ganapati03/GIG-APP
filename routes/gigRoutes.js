import express from 'express';
import {
  getGigs,
  getGigById,
  createGig,
  getMyPostedGigs,
  deleteGig
} from '../controllers/gigController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, getGigs);
router.get('/:id', optionalAuth, getGigById);

// Protected routes
router.post('/', protect, createGig);
router.get('/my/posted', protect, getMyPostedGigs);
router.delete('/:id', protect, deleteGig);

export default router;
