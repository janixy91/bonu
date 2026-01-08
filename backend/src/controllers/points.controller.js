import UserPoints from '../models/UserPoints.model.js';
import Business from '../models/Business.model.js';

/**
 * GET /points
 * Obtener puntos del usuario en todos los bares o en uno específico
 * Query: businessId (opcional)
 */
export const getUserPoints = async (req, res) => {
  try {
    const userId = req.user._id;
    const { businessId } = req.query;

    const query = { userId };
    if (businessId) {
      query.businessId = businessId;
    }

    const userPoints = await UserPoints.find(query)
      .populate('businessId', 'name logoUrl')
      .sort({ lastCheckIn: -1 });

    res.json({
      points: userPoints.map((up) => ({
        business: {
          id: up.businessId._id,
          name: up.businessId.name,
          logoUrl: up.businessId.logoUrl,
        },
        totalPoints: up.totalPoints,
        checkInCount: up.checkInCount,
        lastCheckIn: up.lastCheckIn,
      })),
    });
  } catch (error) {
    console.error('Get user points error:', error);
    res.status(500).json({ error: 'Error al obtener puntos' });
  }
};

