import mongoose from 'mongoose';

/**
 * Modelo para recompensas configurables por puntos
 * Cada bar puede definir sus propias recompensas
 */
const rewardSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    pointsRequired: {
      type: Number,
      required: true,
      min: 1,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Opcional: límite de veces que se puede canjear
    maxRedemptions: {
      type: Number,
      default: null, // null = ilimitado
      min: 1,
    },
    // Contador de veces canjeado
    redemptionCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para búsquedas rápidas
rewardSchema.index({ businessId: 1, active: 1 });
rewardSchema.index({ businessId: 1, pointsRequired: 1 });

export default mongoose.model('Reward', rewardSchema);

