import express from 'express';
import { registerPilot, getPilotRegistrations, approvePilotRegistration } from '../controllers/pilot.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = express.Router();

// Public route
router.post('/register', registerPilot);

// Admin routes (require authentication and admin role)
router.get('/registrations', authenticateToken, requireAdmin, getPilotRegistrations);
router.post('/registrations/:id/approve', authenticateToken, requireAdmin, approvePilotRegistration);

export default router;

