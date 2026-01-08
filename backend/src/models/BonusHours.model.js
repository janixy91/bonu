import mongoose from 'mongoose';

/**
 * Modelo para horarios con puntos extra
 * El bar puede configurar días/horas donde los check-ins dan más puntos
 */
const bonusHoursSchema = new mongoose.Schema(
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
      default: 'Horario especial',
    },
    // Días de la semana: 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    daysOfWeek: {
      type: [Number],
      required: true,
      validate: {
        validator: (days) => days.every((day) => day >= 0 && day <= 6),
        message: 'Los días deben estar entre 0 (Domingo) y 6 (Sábado)',
      },
    },
    // Hora de inicio (formato HH:MM en hora local del bar)
    startTime: {
      type: String,
      required: true,
      match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
    },
    // Hora de fin (formato HH:MM)
    endTime: {
      type: String,
      required: true,
      match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
    },
    // Puntos extra que se dan en este horario
    bonusPoints: {
      type: Number,
      required: true,
      min: 1,
      default: 2,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto
bonusHoursSchema.index({ businessId: 1, active: 1 });

export default mongoose.model('BonusHours', bonusHoursSchema);

