/**
 * Este archivo está deprecado.
 * Usar token.service.js en su lugar para el nuevo sistema JWT simplificado.
 * 
 * Se mantiene por compatibilidad temporal con código legacy.
 * TODO: Eliminar cuando todo el código use token.service.js
 */

import jwt from 'jsonwebtoken';

// DEPRECATED: Usar token.service.js
export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

// DEPRECATED: Ya no se usan refresh tokens
export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

// DEPRECATED: Ya no se usan refresh tokens
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

