import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const promoCardSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
      default: '',
    },
    tipo: {
      type: String,
      enum: ['ilimitada', 'limitada'],
      required: true,
    },
    limiteTotal: {
      type: Number,
      default: null, // null si es ilimitada
      min: 1,
    },
    limiteActual: {
      type: Number,
      default: null, // null si es ilimitada, se inicializa igual que limiteTotal
      min: 0,
    },
    valorRecompensa: {
      type: String,
      required: true,
      trim: true,
    },
    estado: {
      type: String,
      enum: ['activa', 'desactivada', 'eliminada'],
      default: 'activa',
    },
    // Campos legacy para compatibilidad
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['stamp'],
    },
    totalStamps: {
      type: Number,
      min: 1,
    },
    rewardText: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    version: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
promoCardSchema.index({ businessId: 1, estado: 1 });
promoCardSchema.index({ businessId: 1, isDeleted: 1 });

// Virtual para obtener si está activa
promoCardSchema.virtual('estaActiva').get(function() {
  return this.estado === 'activa' && !this.isDeleted;
});

export default mongoose.model('PromoCard', promoCardSchema);


