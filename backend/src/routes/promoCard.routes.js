import express from 'express';
import { createPromoCard, getPromoCard, updatePromoCard, deletePromoCard, togglePromoCardActive } from '../controllers/promoCard.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require admin role
router.use(authenticateToken);
router.use(requireAdmin);

router.post('/', createPromoCard);
router.get('/:id', getPromoCard);
router.put('/:id', updatePromoCard);
router.delete('/:id', deletePromoCard);
router.patch('/:id/activate', togglePromoCardActive);

export default router;

