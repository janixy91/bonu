import Business from '../models/Business.model.js';
import User from '../models/User.model.js';
import PromoCard from '../models/PromoCard.model.js';
import { sendEmail } from '../services/email.service.js';

/**
 * GET /admin/businesses
 * Get all businesses (admin only)
 */
export const getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find()
      .populate('ownerId', 'name email role')
      .sort({ createdAt: -1 });
    
    res.json({ businesses });
  } catch (error) {
    console.error('Get all businesses error:', error);
    res.status(500).json({ error: 'Failed to get businesses' });
  }
};

/**
 * POST /admin/businesses
 * Create a new business (admin only)
 * Body: { name, description, logoUrl, ownerEmail, firstCard: { title, description?, totalStamps, rewardText } }
 */
export const createBusiness = async (req, res) => {
  try {
    const { name, description, logoUrl, ownerEmail, firstCard } = req.body;

    if (!name || !ownerEmail) {
      return res.status(400).json({ error: 'Name and ownerEmail are required' });
    }

    // Validate first card - it's required
    if (!firstCard) {
      return res.status(400).json({ error: 'firstCard is required' });
    }
    if (!firstCard.totalStamps || !firstCard.rewardText) {
      return res.status(400).json({ error: 'firstCard must include totalStamps and rewardText' });
    }
    if (firstCard.totalStamps < 1) {
      return res.status(400).json({ error: 'totalStamps must be at least 1' });
    }

    // Normalize email
    const normalizedEmail = ownerEmail.toLowerCase().trim();
    
    // Find or create owner user
    let owner = await User.findOne({ email: normalizedEmail });
    let temporaryPassword = null;
    let isNewUser = false;
    
    if (!owner) {
      // Generate temporary password
      temporaryPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
      temporaryPassword = temporaryPassword.substring(0, 12); // 12 characters
      
      // Create new user with business_owner role
      owner = new User({
        email: normalizedEmail,
        password: temporaryPassword,
        name: name + ' Owner',
        role: 'business_owner',
      });
      
      try {
        await owner.save();
        isNewUser = true;
      } catch (saveError) {
        // Handle duplicate key error (in case of race condition)
        if (saveError.code === 11000 || saveError.name === 'MongoServerError') {
          // User was created between findOne and save, fetch it
          owner = await User.findOne({ email: normalizedEmail });
          if (!owner) {
            return res.status(500).json({ error: 'Error al crear usuario. Intenta de nuevo.' });
          }
        } else {
          throw saveError;
        }
      }
      
      // Send email with temporary password
      const emailHtml = `
        <h1>¡Bienvenido al Panel de BONU!</h1>
        <p>Se ha creado una cuenta para gestionar el negocio <strong>${name}</strong>.</p>
        <p><strong>Email:</strong> ${normalizedEmail}</p>
        <p><strong>Contraseña temporal:</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 4px; font-size: 16px;">${temporaryPassword}</code></p>
        <p>Por favor, cambia tu contraseña después del primer inicio de sesión.</p>
        <p>Puedes acceder al panel en: <a href="${process.env.FRONTEND_ADMIN_URL || 'http://localhost:5175'}">Panel de Administración</a></p>
      `;
      console.log('📧 Attempting to send email to:', normalizedEmail);
      const emailSent = await sendEmail(normalizedEmail, 'Acceso al Panel de BONU', emailHtml);
      if (!emailSent) {
        console.warn('⚠️ Email could not be sent, but business was created successfully');
      }
    } else {
      // Update existing user to business_owner role if not already
      if (owner.role === 'customer') {
        owner.role = 'business_owner';
        await owner.save();
      }
    }

    // Check if business already exists for this owner
    const existingBusiness = await Business.findOne({ ownerId: owner._id });
    if (existingBusiness) {
      return res.status(400).json({ error: 'This owner already has a business' });
    }

    // Create business
    const business = new Business({
      name,
      description: description || undefined,
      logoUrl: logoUrl || undefined,
      ownerId: owner._id,
    });

    await business.save();

    // Create initial stamp card (required)
    const tipo = firstCard.tipo || (firstCard.totalStamps === null || firstCard.totalStamps === undefined ? 'ilimitada' : 'limitada');
    const initialCard = new PromoCard({
      businessId: business._id,
      nombre: firstCard.title || firstCard.nombre || 'Tarjeta de Sellos',
      descripcion: firstCard.description || firstCard.descripcion || '',
      tipo: tipo,
      limiteTotal: tipo === 'limitada' ? (firstCard.limiteTotal || firstCard.totalStamps) : null,
      limiteActual: tipo === 'limitada' ? (firstCard.limiteTotal || firstCard.totalStamps) : null,
      valorRecompensa: firstCard.rewardText || firstCard.valorRecompensa || '',
      estado: 'activa',
      // Campos legacy para compatibilidad
      title: firstCard.title || firstCard.nombre || 'Tarjeta de Sellos',
      description: firstCard.description || firstCard.descripcion || '',
      type: 'stamp',
      totalStamps: firstCard.totalStamps || 10,
      rewardText: firstCard.rewardText || firstCard.valorRecompensa || '',
      active: true,
      isDeleted: false,
    });
    await initialCard.save();

    const populatedBusiness = await Business.findById(business._id)
      .populate('ownerId', 'name email role');

    res.status(201).json({
      message: 'Business created successfully',
      business: populatedBusiness,
      initialCard: initialCard,
      temporaryPassword: isNewUser ? temporaryPassword : undefined,
      ownerEmail: normalizedEmail,
      isNewUser: isNewUser,
    });
  } catch (error) {
    console.error('Create business error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000 || error.name === 'MongoServerError') {
      if (error.keyPattern?.email) {
        return res.status(400).json({ error: 'Este email ya está registrado' });
      }
      return res.status(400).json({ error: 'Business already exists' });
    }
    
    res.status(500).json({ error: 'Failed to create business' });
  }
};

/**
 * GET /admin/businesses/:id
 * Get business details (admin only)
 */
export const getBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate('ownerId', 'name email role');
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Get all promo cards for this business
    const promoCards = await PromoCard.find({
      businessId: business._id,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    res.json({ business, promoCards });
  } catch (error) {
    console.error('Get business error:', error);
    res.status(500).json({ error: 'Failed to get business' });
  }
};

/**
 * PUT /admin/businesses/:id
 * Update a business (admin only)
 */
export const updateBusiness = async (req, res) => {
  try {
    const { name, description, logoUrl } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const business = await Business.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description: description || undefined,
        logoUrl: logoUrl || undefined,
      },
      { new: true, runValidators: true }
    ).populate('ownerId', 'name email role');

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json({ message: 'Business updated successfully', business });
  } catch (error) {
    console.error('Update business error:', error);
    res.status(500).json({ error: 'Failed to update business' });
  }
};

/**
 * DELETE /admin/businesses/:id
 * Delete a business (admin only)
 */
export const deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    await Business.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Business deleted successfully' });
  } catch (error) {
    console.error('Delete business error:', error);
    res.status(500).json({ error: 'Failed to delete business' });
  }
};

