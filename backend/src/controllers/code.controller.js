import Code from '../models/Code.model.js';
import Business from '../models/Business.model.js';
import PromoCard from '../models/PromoCard.model.js';
import TarjetaCliente from '../models/TarjetaCliente.model.js';
import mongoose from 'mongoose';
import { generateUniqueCode } from '../utils/code.utils.js';

/**
 * POST /codes/redeem
 * Redeem a code for a breakfast/benefit
 * Body: { code: string }
 */
export const redeemCode = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { code } = req.body;
    const userId = req.user._id;

    if (!code || typeof code !== 'string') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Código requerido' });
    }

    // Normalize code to uppercase
    const normalizedCode = code.trim().toUpperCase();

    // Find the code and populate tarjetaId
    const codeDoc = await Code.findOne({ code: normalizedCode })
      .populate('businessId')
      .populate('tarjetaId')
      .session(session);

    if (!codeDoc) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Código no válido' });
    }

    // Check if code is already used
    if (codeDoc.used) {
      await session.abortTransaction();
      return res.status(409).json({ error: 'Este código ya fue utilizado' });
    }

    // Check if code is expired (disabled - codes don't expire)
    // const now = new Date();
    // if (codeDoc.expirationDate && codeDoc.expirationDate < now) {
    //   await session.abortTransaction();
    //   return res.status(410).json({ error: 'Este código ha caducado' });
    // }

    // If code has a tarjetaId, ensure client has the card and add a stamp
    console.log(`[Redeem Code] Code tarjetaId (raw):`, codeDoc.tarjetaId);
    console.log(`[Redeem Code] Code tarjetaId type:`, typeof codeDoc.tarjetaId);
    
    // Handle both populated and non-populated tarjetaId
    let tarjetaIdValue = null;
    if (codeDoc.tarjetaId) {
      if (typeof codeDoc.tarjetaId === 'object' && codeDoc.tarjetaId._id) {
        tarjetaIdValue = codeDoc.tarjetaId._id;
      } else if (typeof codeDoc.tarjetaId === 'object' && codeDoc.tarjetaId.toString) {
        tarjetaIdValue = codeDoc.tarjetaId;
      } else {
        tarjetaIdValue = codeDoc.tarjetaId;
      }
      console.log(`[Redeem Code] Processing tarjetaId:`, tarjetaIdValue);
    } else {
      console.log(`[Redeem Code] No tarjetaId found in code`);
    }
    
    if (tarjetaIdValue) {
      // Check if client already has this card
      let tarjetaCliente = await TarjetaCliente.findOne({
        tarjetaId: tarjetaIdValue,
        clienteId: userId,
      }).session(session);

      console.log(`[Redeem Code] Client has card:`, !!tarjetaCliente);

      // If client doesn't have the card, add it automatically
      if (!tarjetaCliente) {
        console.log(`[Redeem Code] Adding card automatically for client`);
        // Verify the card is active
        const tarjeta = await PromoCard.findOne({
          _id: tarjetaIdValue,
          estado: 'activa',
          isDeleted: false,
        }).session(session);

        if (!tarjeta) {
          console.log(`[Redeem Code] Card not found or not active`);
          await session.abortTransaction();
          return res.status(404).json({ error: 'La tarjeta asociada a este código no está disponible' });
        }

        console.log(`[Redeem Code] Card found:`, tarjeta.nombre, `Type:`, tarjeta.tipo);

        // If it's a limited card, check and decrement limit
        if (tarjeta.tipo === 'limitada') {
          if (!tarjeta.limiteActual || tarjeta.limiteActual <= 0) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'No quedan unidades disponibles de esta tarjeta' });
          }

          const resultado = await PromoCard.updateOne(
            { _id: tarjetaIdValue, limiteActual: { $gt: 0 } },
            { $inc: { limiteActual: -1 }, $inc: { version: 1 } }
          ).session(session);

          if (resultado.modifiedCount === 0) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'No quedan unidades disponibles' });
          }
        }

        // Create the client-card relationship
        tarjetaCliente = new TarjetaCliente({
          tarjetaId: tarjetaIdValue,
          clienteId: userId,
          estado: 'activa',
          fechaAnadida: new Date(),
          sellosActuales: 1, // Add first stamp since they redeemed a code
        });

        await tarjetaCliente.save({ session });
        console.log(`[Redeem Code] Card added successfully with 1 stamp`);
      } else {
        // Client already has the card, just add a stamp
        console.log(`[Redeem Code] Client already has card, adding stamp. Current stamps:`, tarjetaCliente.sellosActuales);
        tarjetaCliente.sellosActuales = (tarjetaCliente.sellosActuales || 0) + 1;
        await tarjetaCliente.save({ session });
        console.log(`[Redeem Code] Stamp added. New stamps:`, tarjetaCliente.sellosActuales);
      }
    }

    // Redeem the code
    const now = new Date();
    codeDoc.used = true;
    codeDoc.userId = userId;
    codeDoc.usedAt = now;
    await codeDoc.save({ session });

    await session.commitTransaction();

    // Return success response with correct format
    res.json({
      status: 'success',
      business: codeDoc.businessId.name,
      benefit: codeDoc.benefitName,
      used_at: codeDoc.usedAt.toISOString(),
      tarjetaAñadida: codeDoc.tarjetaId ? true : false,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Redeem code error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Ya tienes esta tarjeta' });
    }
    res.status(500).json({ error: 'Error al canjear el código' });
  } finally {
    session.endSession();
  }
};

/**
 * POST /codes/generate
 * Generate new codes for a business
 * Body: { businessId, benefitName, expirationDate, count }
 */
export const generateCodes = async (req, res) => {
  try {
    const { businessId, tarjetaId, benefitName, expirationDate, count } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!businessId || !count) {
      return res.status(400).json({ error: 'businessId y count son requeridos' });
    }

    if (!tarjetaId && !benefitName) {
      return res.status(400).json({ error: 'Debe proporcionar tarjetaId o benefitName' });
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

    // Set expiration date (null = no expiration)
    let expiration = null;
    if (expirationDate) {
      expiration = new Date(expirationDate);
      if (isNaN(expiration.getTime())) {
        return res.status(400).json({ error: 'Fecha de expiración inválida' });
      }
    }
    // Codes don't expire by default - expiration is null

    // If tarjetaId is provided, validate it belongs to the business
    let tarjeta = null;
    let finalBenefitName = benefitName;
    
    if (tarjetaId) {
      tarjeta = await PromoCard.findOne({
        _id: tarjetaId,
        businessId: business._id,
        estado: { $ne: 'eliminada' },
      });

      if (!tarjeta) {
        return res.status(404).json({ error: 'Tarjeta no encontrada o no pertenece a este negocio' });
      }

      // Use tarjeta's reward text as benefit name
      finalBenefitName = tarjeta.valorRecompensa || tarjeta.rewardText || tarjeta.nombre || tarjeta.title;
    }

    // Generate codes
    const codes = [];
    for (let i = 0; i < codeCount; i++) {
      const code = await generateUniqueCode();
      codes.push({
        code,
        businessId: business._id,
        tarjetaId: tarjetaId || null,
        benefitName: finalBenefitName,
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
      .populate('tarjetaId', 'nombre valorRecompensa')
      .sort({ createdAt: -1 })
      .select('id code benefitName tarjetaId expirationDate used usedAt createdAt');

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

