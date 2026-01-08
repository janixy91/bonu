import express from 'express';
import { getRewards, redeemReward } from '../controllers/reward.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticateToken, getRewards);
router.post('/redeem', authenticateToken, redeemReward);

export default router;

