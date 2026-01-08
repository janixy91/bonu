import Reward from '../models/Reward.model.js';
import RewardRedemption from '../models/RewardRedemption.model.js';
import UserPoints from '../models/UserPoints.model.js';
import Business from '../models/Business.model.js';

/**
 * GET /rewards
 * Obtener recompensas disponibles de un bar
 * Query: businessId (requerido)
 */
export const getRewards = async (req, res) => {
  try {
    const { businessId } = req.query;

    if (!businessId) {
      return res.status(400).json({ error: 'businessId es requerido' });
    }

    const rewards = await Reward.find({
      businessId,
      active: true,
    }).sort({ pointsRequired: 1 });

    res.json({
      rewards: rewards.map((r) => ({
        id: r._id,
        name: r.name,
        description: r.description,
        pointsRequired: r.pointsRequired,
        maxRedemptions: r.maxRedemptions,
        redemptionCount: r.redemptionCount,
        available: r.maxRedemptions ? r.redemptionCount < r.maxRedemptions : true,
      })),
    });
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ error: 'Error al obtener recompensas' });
  }
};

/**
 * POST /rewards/redeem
 * Canjear una recompensa
 * Body: { rewardId, businessId }
 */
export const redeemReward = async (req, res) => {
  try {
    const { rewardId, businessId } = req.body;
    const userId = req.user._id;

    if (!rewardId || !businessId) {
      return res.status(400).json({ error: 'rewardId y businessId son requeridos' });
    }

    // Obtener la recompensa
    const reward = await Reward.findById(rewardId);
    if (!reward) {
      return res.status(404).json({ error: 'Recompensa no encontrada' });
    }

    if (reward.businessId.toString() !== businessId) {
      return res.status(400).json({ error: 'La recompensa no pertenece a este bar' });
    }

    if (!reward.active) {
      return res.status(400).json({ error: 'Esta recompensa no está disponible' });
    }

    // Verificar límite de canjes
    if (reward.maxRedemptions && reward.redemptionCount >= reward.maxRedemptions) {
      return res.status(400).json({ error: 'Esta recompensa ya no está disponible' });
    }

    // Obtener puntos del usuario
    const userPoints = await UserPoints.findOne({ userId, businessId });
    if (!userPoints || userPoints.totalPoints < reward.pointsRequired) {
      return res.status(400).json({
        error: `No tienes suficientes puntos. Necesitas ${reward.pointsRequired} puntos`,
        required: reward.pointsRequired,
        current: userPoints?.totalPoints || 0,
      });
    }

    // Crear canje
    const redemption = new RewardRedemption({
      userId,
      businessId,
      rewardId,
      pointsUsed: reward.pointsRequired,
    });
    await redemption.save();

    // Descontar puntos
    userPoints.totalPoints -= reward.pointsRequired;
    await userPoints.save();

    // Actualizar contador de canjes de la recompensa
    reward.redemptionCount += 1;
    await reward.save();

    res.json({
      message: `¡Recompensa canjeada! ${reward.name}`,
      redemption: {
        id: redemption._id,
        reward: {
          name: reward.name,
          description: reward.description,
        },
        pointsUsed: reward.pointsRequired,
        remainingPoints: userPoints.totalPoints,
        createdAt: redemption.createdAt,
      },
    });
  } catch (error) {
    console.error('Redeem reward error:', error);
    res.status(500).json({ error: 'Error al canjear recompensa' });
  }
};

