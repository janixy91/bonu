import express from 'express';
import {
  getMyBusiness,
  updateMyBusiness,
} from '../controllers/business-owner.controller.js';
import {
  getTarjetas,
  createTarjeta,
  getTarjeta,
  updateTarjeta,
  desactivarTarjeta,
  deleteTarjeta,
} from '../controllers/tarjeta.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireBusinessOwner } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require business owner role
router.use(authenticateToken);
router.use(requireBusinessOwner);

router.get('/my-business', getMyBusiness);
router.patch('/my-business', updateMyBusiness);

// Tarjetas routes
router.get('/tarjetas', getTarjetas);
router.post('/tarjetas', createTarjeta);
router.get('/tarjetas/:id', getTarjeta);
router.put('/tarjetas/:id', updateTarjeta);
router.patch('/tarjetas/:id/desactivar', desactivarTarjeta);
router.delete('/tarjetas/:id', deleteTarjeta);

export default router;

