import express from 'express';
import {
  createPromoCard,
  getPromoCards,
  getPromoCard,
  updatePromoCard,
  togglePromoCardActive,
  addStock,
  deletePromoCard,
} from '../controllers/promoCard.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireBusinessOwner } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication and business owner role
router.use(authenticateToken);
router.use(requireBusinessOwner);

router.post('/', createPromoCard);
router.get('/', getPromoCards);
router.get('/:id', getPromoCard);
router.put('/:id', updatePromoCard);
router.patch('/:id/activate', togglePromoCardActive);
router.patch('/:id/add-stock', addStock);
router.delete('/:id', deletePromoCard);

export default router;

