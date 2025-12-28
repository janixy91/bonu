import express from 'express';
import { 
  register, 
  login, 
  logout, 
  getMe, 
  updateMe,
  revokeUserTokens
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validate, registerSchema, loginSchema } from '../utils/validation.utils.js';

const router = express.Router();

// Rutas públicas
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Rutas protegidas
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getMe);
router.patch('/me', authenticateToken, updateMe);

// Ruta admin para revocar tokens de un usuario
router.post('/revoke-tokens', authenticateToken, revokeUserTokens);

export default router;

