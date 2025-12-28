import User from '../models/User.model.js';
import { generateToken } from '../services/token.service.js';
import { sendWelcomeEmail } from '../services/email.service.js';

/**
 * POST /auth/register
 * Registro de nuevo usuario
 * Body: { email, password, name, deviceId? }
 */
export const register = async (req, res) => {
  try {
    const { email, password, name, deviceId } = req.body;

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Este email ya está registrado' });
    }

    // Create user
    const user = new User({ email: normalizedEmail, password, name });
    await user.save();

    // Generate JWT token (deviceId es opcional)
    const token = await generateToken(user, deviceId || null);

    // Send welcome email (optional)
    sendWelcomeEmail(user.email, user.name).catch(console.error);

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    
    // Handle duplicate key error (MongoDB unique constraint)
    if (error.code === 11000 || error.name === 'MongoServerError') {
      return res.status(400).json({ error: 'Este email ya está registrado' });
    }
    
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

/**
 * POST /auth/login
 * Login de usuario
 * Body: { email, password, deviceId? }
 */
export const login = async (req, res) => {
  try {
    const { email, password, deviceId } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generate JWT token (deviceId es opcional)
    const token = await generateToken(user, deviceId || null);

    res.json({
      message: 'Login exitoso',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

/**
 * POST /auth/logout
 * Logout - solo responde OK (el token sigue siendo válido hasta que expire)
 * En un sistema más simple, el logout es solo del lado del cliente
 */
export const logout = async (req, res) => {
  res.json({
    message: 'Logout exitoso',
  });
};

/**
 * POST /auth/revoke-tokens (Admin only)
 * Revoca todos los tokens de un usuario incrementando tokenVersion
 * Body: { userId }
 */
export const revokeUserTokens = async (req, res) => {
  try {
    // Verificar que el usuario es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden revocar tokens' });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId es requerido' });
    }

    // Encontrar el usuario y incrementar tokenVersion
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    res.json({
      message: `Tokens del usuario revocados exitosamente. Nuevo tokenVersion: ${user.tokenVersion}`,
      tokenVersion: user.tokenVersion,
    });
  } catch (error) {
    console.error('Revoke tokens error:', error);
    res.status(500).json({ error: 'Error al revocar tokens' });
  }
};

/**
 * GET /auth/me
 * Obtener información del usuario autenticado
 * Requiere autenticación
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Error al obtener información del usuario' });
  }
};

/**
 * PATCH /auth/me
 * Actualizar perfil del usuario
 * Requiere autenticación
 */
export const updateMe = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.name = name.trim();
    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Update me error:', error);
    res.status(500).json({ error: 'Failed to update user info' });
  }
};
