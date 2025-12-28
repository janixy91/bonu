import PilotRegistration from '../models/PilotRegistration.model.js';
import User from '../models/User.model.js';
import { z } from 'zod';

import Business from '../models/Business.model.js';
import { sendEmail } from '../services/email.service.js';
import crypto from 'crypto';

/**
 * GET /pilot/registrations
 * Get all pilot registrations (admin only)
 */
export const getPilotRegistrations = async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    const registrations = await PilotRegistration.find(query)
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      registrations,
      total: registrations.length,
    });
  } catch (error) {
    console.error('Get pilot registrations error:', error);
    res.status(500).json({ error: 'Error al obtener las solicitudes de registro' });
  }
};

// Schema for pilot registration
export const pilotRegistrationSchema = z.object({
  businessName: z.string().min(2, 'El nombre del negocio debe tener al menos 2 caracteres'),
  email: z.string().email('Formato de email inválido'),
  contactName: z.string().min(2, 'El nombre de contacto debe tener al menos 2 caracteres'),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
});

/**
 * POST /pilot/register
 * Register a business for the pilot program
 */
export const registerPilot = async (req, res) => {
  try {
    const { businessName, email, contactName, address } = req.body;

    // Validate input
    const validationResult = pilotRegistrationSchema.safeParse({
      businessName,
      email,
      contactName,
      address,
    });

    if (!validationResult.success) {
      return res.status(400).json({
        error: validationResult.error.errors[0].message,
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists in users
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Este email ya está registrado' });
    }

    // Check if there's already a pending registration for this email
    const existingRegistration = await PilotRegistration.findOne({
      email: normalizedEmail,
      status: 'pending',
    });
    if (existingRegistration) {
      return res.status(400).json({
        error: 'Ya existe una solicitud pendiente para este email',
      });
    }

    // Create pilot registration
    const registration = new PilotRegistration({
      businessName: businessName.trim(),
      email: normalizedEmail,
      contactName: contactName.trim(),
      address: address.trim(),
      status: 'pending',
    });

    await registration.save();

    // TODO: Send email notification to admins
    console.log('Pilot registration received:', {
      id: registration._id,
      businessName,
      email: normalizedEmail,
      contactName,
      address,
    });

    res.status(201).json({
      message: 'Solicitud de registro al programa piloto enviada correctamente',
      data: {
        id: registration._id,
        businessName: registration.businessName,
        email: registration.email,
        contactName: registration.contactName,
        address: registration.address,
      },
    });
  } catch (error) {
    console.error('Pilot registration error:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud de registro' });
  }
};

/**
 * POST /pilot/registrations/:id/approve
 * Approve a pilot registration and create user + business (admin only)
 */
export const approvePilotRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the registration
    const registration = await PilotRegistration.findById(id);
    if (!registration) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    if (registration.status !== 'pending') {
      return res.status(400).json({ 
        error: `Esta solicitud ya fue ${registration.status === 'approved' ? 'aprobada' : 'rechazada'}` 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: registration.email });
    if (existingUser) {
      return res.status(400).json({ error: 'Ya existe un usuario con este email' });
    }

    // Generate temporary password
    const temporaryPassword = crypto.randomBytes(8).toString('hex');
    
    // Create user
    const user = new User({
      email: registration.email,
      name: registration.contactName,
      password: temporaryPassword, // Will be hashed by pre-save hook
      role: 'business_owner',
    });
    await user.save();

    // Create business
    const business = new Business({
      name: registration.businessName,
      description: registration.address, // Usamos la dirección como descripción
      ownerId: user._id,
    });
    await business.save();

    // Update registration status
    registration.status = 'approved';
    await registration.save();

    // Send welcome email with credentials
    const emailHtml = `
      <h2>¡Bienvenido a BONU!</h2>
      <p>Tu solicitud al programa piloto ha sido aprobada.</p>
      <p><strong>Credenciales de acceso:</strong></p>
      <ul>
        <li><strong>Email:</strong> ${registration.email}</li>
        <li><strong>Contraseña temporal:</strong> ${temporaryPassword}</li>
      </ul>
      <p>Por favor, cambia tu contraseña después del primer inicio de sesión.</p>
      <p>Accede al panel en: <a href="${process.env.ADMIN_PANEL_URL}/login">Panel de Administración</a></p>
    `;

    const emailSent = await sendEmail(registration.email, 'Bienvenido a BONU - Programa Piloto', emailHtml);
    if (!emailSent) {
      console.warn('⚠️ Email could not be sent, but registration was approved successfully');
    }

    res.json({
      message: 'Solicitud aprobada exitosamente. Usuario y negocio creados.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        business: {
          id: business._id,
          name: business.name,
          description: business.description,
        },
        temporaryPassword,
        emailSent: !!emailSent,
      },
    });
  } catch (error) {
    console.error('Approve pilot registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000 || error.name === 'MongoServerError') {
      if (error.keyPattern?.email) {
        return res.status(400).json({ error: 'Ya existe un usuario con este email' });
      }
    }
    
    res.status(500).json({ error: 'Error al aprobar la solicitud' });
  }
};
