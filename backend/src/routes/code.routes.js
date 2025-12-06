import express from 'express';
import { redeemCode, generateCodes, getBusinessCodes } from '../controllers/code.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireBusinessOwner } from '../middleware/role.middleware.js';
import { validate, redeemCodeSchema } from '../utils/validation.utils.js';
import { codeRedemptionRateLimit } from '../middleware/rateLimit.middleware.js';
import { codeRedemptionLogger } from '../middleware/logging.middleware.js';

const router = express.Router();

// Redeem a code (requires authentication, rate limiting, and logging)
router.post(
  '/redeem',
  authenticateToken,
  codeRedemptionRateLimit,
  codeRedemptionLogger,
  validate(redeemCodeSchema),
  redeemCode
);

// Generate codes (requires business owner or admin)
router.post(
  '/generate',
  authenticateToken,
  requireBusinessOwner,
  generateCodes
);

// Get business codes (requires business owner or admin)
router.get(
  '/business/:businessId',
  authenticateToken,
  requireBusinessOwner,
  getBusinessCodes
);

export default router;

