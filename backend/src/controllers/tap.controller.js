import TapIntent from '../models/TapIntent.model.js';
import Business from '../models/Business.model.js';
import CheckIn from '../models/CheckIn.model.js';
import UserPoints from '../models/UserPoints.model.js';
import BonusHours from '../models/BonusHours.model.js';
import mongoose from 'mongoose';

/**
 * GET /tap
 * Endpoint público para crear un TapIntent cuando se abre la URL NFC
 * Query: barId (public business ID)
 */
export const createTapIntent = async (req, res) => {
  try {
    const { barId } = req.query;

    if (!barId) {
      return res.status(400).json({ error: 'barId es requerido' });
    }

    // Validar que el bar existe y está activo
    let business;
    try {
      business = await Business.findById(barId);
    } catch (error) {
      // Si barId no es un ObjectId válido
      return res.status(400).json({ error: 'barId inválido' });
    }

    if (!business) {
      return res.status(404).json({ error: 'Bar no encontrado' });
    }

    // Crear TapIntent con expiración de 2 minutos
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutos

    const tapIntent = new TapIntent({
      barId: business._id,
      expiresAt,
      used: false,
    });

    await tapIntent.save();

    // Devolver respuesta con deep link y landing page
    const tapIntentId = tapIntent._id.toString();
    const deepLink = `bonu://tap?tapIntentId=${tapIntentId}`;
    const landingUrl = `${process.env.FRONTEND_URL || 'https://bonu.app'}/tap?tapIntentId=${tapIntentId}`;

    res.json({
      success: true,
      tapIntentId,
      business: {
        id: business._id.toString(),
        name: business.name,
        logoUrl: business.logoUrl || null,
      },
      deepLink,
      landingUrl,
      expiresAt: tapIntent.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Create tap intent error:', error);
    res.status(500).json({ error: 'Error al crear intención de tap' });
  }
};

/**
 * POST /stamps/from-tap
 * Endpoint autenticado para validar TapIntent y hacer check-in
 * Body: { tapIntentId }
 */
export const addStampFromTap = async (req, res) => {
  try {
    const { tapIntentId } = req.body;
    const userId = req.user._id;

    if (!tapIntentId) {
      return res.status(400).json({ error: 'tapIntentId es requerido' });
    }

    // Validar formato de ObjectId
    if (!mongoose.Types.ObjectId.isValid(tapIntentId)) {
      return res.status(400).json({ error: 'tapIntentId inválido' });
    }

    // Buscar TapIntent
    const tapIntent = await TapIntent.findById(tapIntentId).populate('barId');

    if (!tapIntent) {
      return res.status(404).json({ error: 'TapIntent no encontrado' });
    }

    // Validar que no esté usado
    if (tapIntent.used) {
      return res.status(400).json({ error: 'Este tap ya fue utilizado' });
    }

    // Validar que no esté expirado
    if (new Date() > tapIntent.expiresAt) {
      return res.status(400).json({ error: 'Este tap ha expirado' });
    }

    const business = tapIntent.barId;

    // Validar que el bar existe y está activo
    if (!business) {
      return res.status(404).json({ error: 'Bar no encontrado' });
    }

    // Rate limiting: máximo 1 check-in por día por bar
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // Inicio del día (00:00:00)
    
    const todayCheckIn = await CheckIn.findOne({
      userId,
      businessId: business._id,
      createdAt: { $gte: todayStart },
    });

    if (todayCheckIn) {
      // Calcular cuánto falta para mañana
      const tomorrow = new Date(todayStart);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const hoursUntilTomorrow = Math.ceil((tomorrow.getTime() - Date.now()) / (1000 * 60 * 60));
      
      return res.status(429).json({
        error: 'Ya has hecho check-in hoy en este local. Vuelve mañana para ganar más puntos',
        retryAfter: Math.ceil((tomorrow.getTime() - Date.now()) / 1000),
        hoursUntilTomorrow,
      });
    }

    // Calcular puntos según horario
    let points = 1; // Puntos base
    let bonusReason = 'normal';

    // Verificar si estamos en horario con bonus
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Domingo, 6 = Sábado
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const activeBonusHours = await BonusHours.find({
      businessId: business._id,
      active: true,
      daysOfWeek: currentDay,
    });

    for (const bonusHour of activeBonusHours) {
      if (currentTime >= bonusHour.startTime && currentTime <= bonusHour.endTime) {
        points = bonusHour.bonusPoints;
        bonusReason = 'bonus_hours';
        break;
      }
    }

    // Crear check-in
    const checkIn = new CheckIn({
      userId,
      businessId: business._id,
      points,
      method: 'nfc',
      bonusReason,
    });

    await checkIn.save();

    // Actualizar o crear UserPoints
    let userPoints = await UserPoints.findOne({ userId, businessId: business._id });
    if (!userPoints) {
      userPoints = new UserPoints({
        userId,
        businessId: business._id,
        totalPoints: points,
        lastCheckIn: now,
        checkInCount: 1,
      });
    } else {
      userPoints.totalPoints += points;
      userPoints.lastCheckIn = now;
      userPoints.checkInCount += 1;
    }
    await userPoints.save();

    // Marcar TapIntent como usado
    tapIntent.used = true;
    tapIntent.userId = userId;
    await tapIntent.save();

    res.json({
      message: 'Check-in registrado exitosamente',
      checkIn: {
        id: checkIn._id,
        points,
        bonusReason,
        createdAt: checkIn.createdAt,
      },
      totalPoints: userPoints.totalPoints,
    });
  } catch (error) {
    console.error('Add check-in from tap error:', error);
    res.status(500).json({ error: 'Error al registrar check-in desde tap' });
  }
};

/**
 * GET /tap/:tapIntentId
 * Obtener información de un TapIntent (público, para mostrar en landing)
 */
export const getTapIntent = async (req, res) => {
  try {
    const { tapIntentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tapIntentId)) {
      return res.status(400).json({ error: 'tapIntentId inválido' });
    }

    const tapIntent = await TapIntent.findById(tapIntentId).populate('barId');

    if (!tapIntent) {
      return res.status(404).json({ error: 'TapIntent no encontrado' });
    }

    // Validar que no esté expirado
    if (new Date() > tapIntent.expiresAt) {
      return res.status(400).json({ error: 'Este tap ha expirado' });
    }

    // Validar que no esté usado
    if (tapIntent.used) {
      return res.status(400).json({ error: 'Este tap ya fue utilizado' });
    }

    const business = tapIntent.barId;

    res.json({
      success: true,
      tapIntentId: tapIntent._id.toString(),
      business: {
        id: business._id.toString(),
        name: business.name,
        logoUrl: business.logoUrl || null,
      },
      expiresAt: tapIntent.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Get tap intent error:', error);
    res.status(500).json({ error: 'Error al obtener TapIntent' });
  }
};

