import express from 'express';
import { createCheckIn, manualCheckIn, getCheckInHistory } from '../controllers/checkin.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.post('/', authenticateToken, createCheckIn);
router.post('/manual', authenticateToken, manualCheckIn);
router.get('/history', authenticateToken, getCheckInHistory);

export default router;

