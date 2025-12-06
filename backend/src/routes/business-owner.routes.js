import express from 'express';
import {
  getMyBusiness,
  updateMyBusiness,
} from '../controllers/business-owner.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireBusinessOwner } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require business owner role
router.use(authenticateToken);
router.use(requireBusinessOwner);

router.get('/my-business', getMyBusiness);
router.patch('/my-business', updateMyBusiness);

export default router;

