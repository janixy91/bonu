import express from 'express';
import { validateStampCode } from '../controllers/stamp.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validate stamp code (for bar employees)
router.post('/validate', authenticateToken, validateStampCode);

export default router;

