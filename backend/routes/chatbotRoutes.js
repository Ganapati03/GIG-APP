import express from 'express';
import {
  chatWithBot,
  suggestBidProposal,
  analyzeGig
} from '../controllers/chatbotController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All chatbot routes are protected
router.post('/', protect, chatWithBot);
router.post('/suggest-bid', protect, suggestBidProposal);
router.post('/analyze-gig', protect, analyzeGig);

export default router;
