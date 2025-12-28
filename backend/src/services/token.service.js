import jwt from 'jsonwebtoken';
import Business from '../models/Business.model.js';

/**
 * Genera un JWT con el payload completo requerido
 * @param {Object} user - Usuario de MongoDB
 * @param {string} deviceId - UUID del dispositivo (opcional, para tracking)
 * @returns {string} JWT token
 */
export const generateToken = async (user, deviceId = null) => {
  // Obtener barId si el usuario es business_owner
  let barId = null;
  if (user.role === 'business_owner') {
    const business = await Business.findOne({ ownerId: user._id });
    barId = business ? business._id.toString() : null;
  }

  const payload = {
    userId: user._id.toString(),
    role: user.role,
    barId,
    tokenVersion: user.tokenVersion || 0,
  };

  // Añadir deviceId al payload si se proporciona (opcional)
  if (deviceId) {
    payload.deviceId = deviceId;
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d',
  });

  return token;
};

/**
 * Verifica y decodifica un JWT
 * @param {string} token - JWT token
 * @returns {Object} Payload decodificado
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
