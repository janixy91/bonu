import express from 'express';
import { getUserPoints } from '../controllers/points.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticateToken, getUserPoints);

export default router;

