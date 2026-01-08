import express from 'express';
import {
  getAllBusinesses,
  createBusiness,
  getBusiness,
  updateBusiness,
  deleteBusiness,
  getBusinessCheckIns,
  getBusinessStats,
} from '../controllers/admin.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require admin role
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/businesses', getAllBusinesses);
router.post('/businesses', createBusiness);
router.get('/businesses/:id', getBusiness);
router.put('/businesses/:id', updateBusiness);
router.delete('/businesses/:id', deleteBusiness);
router.get('/businesses/:id/checkins', getBusinessCheckIns);
router.get('/businesses/:id/stats', getBusinessStats);

export default router;

