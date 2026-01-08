import express from 'express';
import { createTapIntent, getTapIntent, addStampFromTap } from '../controllers/tap.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Rutas públicas
router.get('/tap', createTapIntent);
router.get('/tap/:tapIntentId', getTapIntent);

// Ruta autenticada para añadir sello desde tap
router.post('/stamps/from-tap', authenticateToken, addStampFromTap);

export default router;

