import express from 'express';
import { register, login, refresh, getMe } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validate, registerSchema, loginSchema } from '../utils/validation.utils.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.get('/me', authenticateToken, getMe);

export default router;

