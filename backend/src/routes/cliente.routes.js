import express from 'express';
import {
  getTarjetasDisponibles,
  anadirTarjeta,
  getMisTarjetas,
  canjearTarjeta,
} from '../controllers/clienteTarjeta.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/tarjetas-disponibles', getTarjetasDisponibles);
router.post('/tarjetas/:id/anadir', anadirTarjeta);
router.get('/mis-tarjetas', getMisTarjetas);
router.patch('/tarjetas/:id/canjear', canjearTarjeta);

export default router;

