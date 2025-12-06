import express from 'express';
import {
  createBusiness,
  listBusinesses,
  getBusiness,
  updateBusiness,
  deleteBusiness,
} from '../controllers/business.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validate, businessSchema } from '../utils/validation.utils.js';

const router = express.Router();

router.post('/', authenticateToken, validate(businessSchema), createBusiness);
router.get('/', listBusinesses);
router.get('/:id', getBusiness);
router.patch('/:id', authenticateToken, updateBusiness);
router.delete('/:id', authenticateToken, deleteBusiness);

export default router;

