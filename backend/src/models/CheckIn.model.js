import mongoose from 'mongoose';

/**
 * Modelo para check-ins de clientes en bares
 * Cada check-in suma puntos al cliente
 */
const checkInSchema = new mongoose.Schema(
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
    points: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    method: {
      type: String,
      enum: ['nfc', 'code', 'manual'],
      required: true,
      default: 'nfc',
    },
    bonusReason: {
      type: String,
      enum: ['normal', 'bonus_hours', 'manual'],
      default: 'normal',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    // Para privacidad: el bar solo ve un alias, no el userId real
    customerAlias: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para consultas rápidas
checkInSchema.index({ businessId: 1, createdAt: -1 });
checkInSchema.index({ userId: 1, businessId: 1, createdAt: -1 });
checkInSchema.index({ businessId: 1, createdAt: 1 }); // Para estadísticas por fecha

// Pre-save: establecer customerAlias si no existe
checkInSchema.pre('save', async function (next) {
  if (!this.customerAlias) {
    const User = mongoose.model('User');
    const user = await User.findById(this.userId).select('name');
    if (user) {
      // Usar solo el primer nombre para privacidad
      this.customerAlias = user.name.split(' ')[0] || 'Cliente';
    }
  }
  next();
});

export default mongoose.model('CheckIn', checkInSchema);

