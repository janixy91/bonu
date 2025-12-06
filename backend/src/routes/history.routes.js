import express from 'express';
import { getUserHistory } from '../controllers/history.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/:userId', authenticateToken, getUserHistory);

export default router;

