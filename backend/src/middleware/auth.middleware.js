import User from '../models/User.model.js';
import { verifyToken } from '../services/token.service.js';

/**
 * Middleware de autenticación JWT simplificado
 * 
 * Valida:
 * 1. Token JWT válido
 * 2. Usuario existe y está activo
 * 
 * Inyecta req.user con información completa
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // 1. Extraer token del header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    // 2. Verificar y decodificar JWT
    let payload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(403).json({ error: 'Token inválido' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(403).json({ error: 'Token expirado' });
      }
      throw error;
    }

    // 3. Verificar que el usuario existe y está activo
    const user = await User.findById(payload.userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // 4. Verificar que el token no ha sido revocado (tokenVersion)
    const tokenVersion = payload.tokenVersion || 0;
    const userTokenVersion = user.tokenVersion || 0;
    if (tokenVersion < userTokenVersion) {
      return res.status(403).json({ error: 'Token revocado. Por favor, inicia sesión nuevamente' });
    }

    // 5. Inyectar usuario en req.user con información del token
    req.user = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: payload.role || user.role,
      barId: payload.barId || null,
      deviceId: payload.deviceId || null,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Error de autenticación' });
  }
};
