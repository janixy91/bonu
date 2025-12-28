import PilotRegistration from '../models/PilotRegistration.model.js';
import User from '../models/User.model.js';
import { z } from 'zod';

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
