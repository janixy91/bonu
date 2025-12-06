import express from 'express';
import {
  createCard,
  getUserCards,
  getCard,
  addStamp,
  redeemReward,
} from '../controllers/card.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authenticateToken, createCard);
router.get('/:userId', authenticateToken, getUserCards);
router.get('/card/:cardId', authenticateToken, getCard);
router.patch('/:cardId/stamp', authenticateToken, addStamp);
router.post('/:cardId/redeem', authenticateToken, redeemReward);

export default router;

