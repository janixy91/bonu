import express from 'express';
import { getBusinessStats } from '../controllers/business-stats.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/:id/stats', authenticateToken, getBusinessStats);

export default router;

