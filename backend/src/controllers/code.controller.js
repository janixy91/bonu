import Code from '../models/Code.model.js';
import Business from '../models/Business.model.js';
import { generateUniqueCode } from '../utils/code.utils.js';

/**
 * POST /codes/redeem
 * Redeem a code for a breakfast/benefit
 * Body: { code: string }
 */
export const redeemCode = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Código requerido' });
    }

    // Normalize code to uppercase
    const normalizedCode = code.trim().toUpperCase();

    // Find the code
    const codeDoc = await Code.findOne({ code: normalizedCode }).populate('businessId');

    if (!codeDoc) {
      return res.status(404).json({ error: 'Código no válido' });
    }

    // Check if code is already used
    if (codeDoc.used) {
      return res.status(409).json({ error: 'Este código ya fue utilizado' });
    }

    // Check if code is expired
    const now = new Date();
    if (codeDoc.expirationDate && codeDoc.expirationDate < now) {
      return res.status(410).json({ error: 'Este código ha caducado' });
    }

    // Redeem the code
    codeDoc.used = true;
    codeDoc.userId = userId;
    codeDoc.usedAt = now;
    await codeDoc.save();

    // Return success response with correct format
    res.json({
      status: 'success',
      business: codeDoc.businessId.name,
      benefit: codeDoc.benefitName,
      used_at: codeDoc.usedAt.toISOString(),
    });
  } catch (error) {
    console.error('Redeem code error:', error);
    res.status(500).json({ error: 'Error al canjear el código' });
  }
};

/**
 * POST /codes/generate
 * Generate new codes for a business
 * Body: { businessId, benefitName, expirationDate, count }
 */
export const generateCodes = async (req, res) => {
  try {
    const { businessId, benefitName, expirationDate, count } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!businessId || !benefitName || !expirationDate || !count) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verify business exists and user owns it
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Negocio no encontrado' });
    }

    // Check ownership (business owner or admin)
    if (business.ownerId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para generar códigos de este negocio' });
    }

    // Validate count
    const codeCount = parseInt(count);
    if (codeCount < 1 || codeCount > 100) {
      return res.status(400).json({ error: 'El número de códigos debe estar entre 1 y 100' });
    }

    // Validate expiration date
    const expiration = new Date(expirationDate);
    if (isNaN(expiration.getTime())) {
      return res.status(400).json({ error: 'Fecha de expiración inválida' });
    }

    // Generate codes
    const codes = [];
    for (let i = 0; i < codeCount; i++) {
      const code = await generateUniqueCode();
      codes.push({
        code,
        businessId: business._id,
        benefitName,
        expirationDate: expiration,
        used: false,
        usedAt: null,
      });
    }

    // Insert codes
    const createdCodes = await Code.insertMany(codes);

    res.json({
      message: `${createdCodes.length} códigos generados exitosamente`,
      codes: createdCodes.map((c) => ({
        id: c.id,
        code: c.code,
        benefitName: c.benefitName,
        expirationDate: c.expirationDate,
      })),
    });
  } catch (error) {
    console.error('Generate codes error:', error);
    res.status(500).json({ error: 'Error al generar códigos' });
  }
};

/**
 * GET /codes/business/:businessId
 * Get all codes for a business
 */
export const getBusinessCodes = async (req, res) => {
  try {
    const { businessId } = req.params;
    const userId = req.user._id;

    // Verify business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Negocio no encontrado' });
    }

    // Check ownership (business owner or admin)
    if (business.ownerId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para ver códigos de este negocio' });
    }

    // Get codes
    const codes = await Code.find({ businessId })
      .sort({ createdAt: -1 })
      .select('id code benefitName expirationDate used usedAt createdAt');

    res.json({
      codes,
      total: codes.length,
      used: codes.filter((c) => c.used).length,
      unused: codes.filter((c) => !c.used).length,
    });
  } catch (error) {
    console.error('Get business codes error:', error);
    res.status(500).json({ error: 'Error al obtener códigos' });
  }
};

