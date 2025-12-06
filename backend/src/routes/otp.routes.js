import express from 'express';
import { getCurrentOTPCode } from '../controllers/otp.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get current OTP for authenticated user
router.get('/current/:userId', authenticateToken, getCurrentOTPCode);

export default router;

