import mongoose from 'mongoose';

/**
 * Modelo para puntos acumulados por cliente en cada bar
 * Mantiene el total de puntos y permite consultas rápidas
 */
const userPointsSchema = new mongoose.Schema(
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
    totalPoints: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    // Último check-in para estadísticas
    lastCheckIn: {
      type: Date,
    },
    // Total de check-ins para estadísticas
    checkInCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Índice único para evitar duplicados
userPointsSchema.index({ userId: 1, businessId: 1 }, { unique: true });
// Índice para estadísticas del bar
userPointsSchema.index({ businessId: 1, totalPoints: -1 });
userPointsSchema.index({ businessId: 1, checkInCount: -1 });

export default mongoose.model('UserPoints', userPointsSchema);

