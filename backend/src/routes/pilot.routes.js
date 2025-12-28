import express from 'express';
import { registerPilot, getPilotRegistrations } from '../controllers/pilot.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = express.Router();

// Public route
router.post('/register', registerPilot);

// Admin routes (require authentication and admin role)
router.get('/registrations', authenticateToken, requireAdmin, getPilotRegistrations);

export default router;

