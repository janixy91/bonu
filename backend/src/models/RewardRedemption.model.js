import mongoose from 'mongoose';

/**
 * Modelo para canjes de recompensas
 * Registra cuando un cliente canjea una recompensa
 */
const rewardRedemptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    rewardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reward',
      required: true,
    },
    pointsUsed: {
      type: Number,
      required: true,
      min: 1,
    },
    // Para privacidad: el bar solo ve un alias
    customerAlias: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
rewardRedemptionSchema.index({ businessId: 1, createdAt: -1 });
rewardRedemptionSchema.index({ userId: 1, businessId: 1, createdAt: -1 });

// Pre-save: establecer customerAlias
rewardRedemptionSchema.pre('save', async function (next) {
  if (!this.customerAlias) {
    const User = mongoose.model('User');
    const user = await User.findById(this.userId).select('name');
    if (user) {
      this.customerAlias = user.name.split(' ')[0] || 'Cliente';
    }
  }
  next();
});

export default mongoose.model('RewardRedemption', rewardRedemptionSchema);

