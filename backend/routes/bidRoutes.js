import express from 'express';
import {
  createBid,
  getBidsForGig,
  getMyBids,
  hireBid
} from '../controllers/bidController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All bid routes are protected
router.post('/', protect, createBid);
router.get('/:gigId', protect, getBidsForGig);
router.get('/my/submitted', protect, getMyBids);
router.patch('/:bidId/hire', protect, hireBid);

export default router;
