import CheckIn from '../models/CheckIn.model.js';
import UserPoints from '../models/UserPoints.model.js';
import Business from '../models/Business.model.js';
import BonusHours from '../models/BonusHours.model.js';
import mongoose from 'mongoose';

/**
 * POST /checkin
 * Registrar un check-in (desde NFC o código)
 * Body: { businessId, method: 'nfc' | 'code' | 'manual' }
 */
export const createCheckIn = async (req, res) => {
  try {
    const { businessId, method = 'nfc' } = req.body;
    const userId = req.user._id;

    if (!businessId) {
      return res.status(400).json({ error: 'businessId es requerido' });
    }

    // Validar que el bar existe
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Bar no encontrado' });
    }

    // Rate limiting: máximo 1 check-in por día por bar
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // Inicio del día (00:00:00)
    
    const todayCheckIn = await CheckIn.findOne({
      userId,
      businessId,
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
      businessId,
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
      businessId,
      points,
      method,
      bonusReason,
    });

    await checkIn.save();

    // Actualizar o crear UserPoints
    let userPoints = await UserPoints.findOne({ userId, businessId });
    if (!userPoints) {
      userPoints = new UserPoints({
        userId,
        businessId,
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
    console.error('Create check-in error:', error);
    res.status(500).json({ error: 'Error al registrar check-in' });
  }
};

/**
 * POST /checkin/manual
 * El bar añade puntos manualmente a un cliente (requiere código o identificación)
 * Body: { businessId, points, code? }
 */
export const manualCheckIn = async (req, res) => {
  try {
    const { businessId, points: manualPoints, code } = req.body;
    const userId = req.user._id; // El usuario que hace el check-in (cliente)

    if (!businessId || !manualPoints) {
      return res.status(400).json({ error: 'businessId y points son requeridos' });
    }

    if (manualPoints < 1) {
      return res.status(400).json({ error: 'Los puntos deben ser al menos 1' });
    }

    // Validar que el bar existe y el usuario logueado es el dueño
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Bar no encontrado' });
    }

    // Rate limiting: máximo 1 check-in por día por bar (también aplica a manual)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayCheckIn = await CheckIn.findOne({
      userId,
      businessId,
      createdAt: { $gte: todayStart },
    });

    if (todayCheckIn) {
      const tomorrow = new Date(todayStart);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return res.status(429).json({
        error: 'Ya has hecho check-in hoy en este local. Vuelve mañana para ganar más puntos',
        retryAfter: Math.ceil((tomorrow.getTime() - Date.now()) / 1000),
      });
    }

    // Crear check-in manual
    const checkIn = new CheckIn({
      userId,
      businessId,
      points: manualPoints,
      method: 'manual',
      bonusReason: 'manual',
      notes: code ? `Código: ${code}` : 'Puntos manuales',
    });

    await checkIn.save();

    // Actualizar UserPoints
    let userPoints = await UserPoints.findOne({ userId, businessId });
    if (!userPoints) {
      userPoints = new UserPoints({
        userId,
        businessId,
        totalPoints: manualPoints,
        lastCheckIn: new Date(),
        checkInCount: 1,
      });
    } else {
      userPoints.totalPoints += manualPoints;
      userPoints.lastCheckIn = new Date();
      userPoints.checkInCount += 1;
    }
    await userPoints.save();

    res.json({
      message: 'Puntos añadidos manualmente',
      checkIn: {
        id: checkIn._id,
        points: manualPoints,
        createdAt: checkIn.createdAt,
      },
      totalPoints: userPoints.totalPoints,
    });
  } catch (error) {
    console.error('Manual check-in error:', error);
    res.status(500).json({ error: 'Error al añadir puntos manualmente' });
  }
};

/**
 * GET /checkin/history
 * Obtener historial de check-ins del usuario
 * Query: businessId (opcional)
 */
export const getCheckInHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { businessId } = req.query;

    const query = { userId };
    if (businessId) {
      query.businessId = businessId;
    }

    const checkIns = await CheckIn.find(query)
      .populate('businessId', 'name logoUrl')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      checkIns: checkIns.map((ci) => ({
        id: ci._id,
        business: {
          id: ci.businessId._id,
          name: ci.businessId.name,
          logoUrl: ci.businessId.logoUrl,
        },
        points: ci.points,
        method: ci.method,
        bonusReason: ci.bonusReason,
        createdAt: ci.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get check-in history error:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};

