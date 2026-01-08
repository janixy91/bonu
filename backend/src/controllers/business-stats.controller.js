import CheckIn from '../models/CheckIn.model.js';
import UserPoints from '../models/UserPoints.model.js';
import RewardRedemption from '../models/RewardRedemption.model.js';
import Business from '../models/Business.model.js';
import mongoose from 'mongoose';

/**
 * GET /business/:id/stats
 * Obtener estadísticas del bar (solo para dueños)
 * Respeta privacidad: solo muestra alias, no datos personales
 */
export const getBusinessStats = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;

    // Verificar que el usuario es el dueño del bar
    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ error: 'Bar no encontrado' });
    }

    if (business.ownerId.toString() !== ownerId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para ver estas estadísticas' });
    }

    // Estadísticas básicas
    const totalCustomers = await UserPoints.countDocuments({ businessId: id });
    const totalCheckIns = await CheckIn.countDocuments({ businessId: id });
    const totalRedemptions = await RewardRedemption.countDocuments({ businessId: id });

    // Check-ins de los últimos 30 días
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentCheckIns = await CheckIn.countDocuments({
      businessId: id,
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Top clientes (por puntos, solo alias para privacidad)
    const topCustomers = await UserPoints.find({ businessId: id })
      .sort({ totalPoints: -1 })
      .limit(10)
      .populate('userId', 'name')
      .lean();

    // Obtener alias de los check-ins para los top clientes
    const topCustomerIds = topCustomers.map((tc) => tc.userId._id);
    const recentCheckInsForTop = await CheckIn.find({
      businessId: id,
      userId: { $in: topCustomerIds },
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Crear mapa de alias
    const aliasMap = {};
    recentCheckInsForTop.forEach((ci) => {
      if (!aliasMap[ci.userId.toString()]) {
        aliasMap[ci.userId.toString()] = ci.customerAlias;
      }
    });

    // Check-ins por día (últimos 7 días)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const checkInsByDay = await CheckIn.aggregate([
      {
        $match: {
          businessId: new mongoose.Types.ObjectId(id),
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({
      business: {
        id: business._id,
        name: business.name,
      },
      stats: {
        totalCustomers,
        totalCheckIns,
        totalRedemptions,
        recentCheckIns,
        checkInsByDay: checkInsByDay.map((day) => ({
          date: day._id,
          count: day.count,
        })),
      },
      topCustomers: topCustomers.map((tc) => ({
        alias: aliasMap[tc.userId._id.toString()] || 'Cliente',
        totalPoints: tc.totalPoints,
        checkInCount: tc.checkInCount,
        lastCheckIn: tc.lastCheckIn,
      })),
    });
  } catch (error) {
    console.error('Get business stats error:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

