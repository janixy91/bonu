import mongoose from 'mongoose';

/**
 * Modelo para intenciones de tap NFC
 * Representa una intención temporal de añadir un sello mediante NFC
 */
const tapIntentSchema = new mongoose.Schema(
  {
    barId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0, // TTL index - MongoDB eliminará automáticamente documentos expirados
    },
    used: {
      type: Boolean,
      default: false,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Se establece cuando se usa
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para búsquedas rápidas
tapIntentSchema.index({ barId: 1, used: 1 });
// TTL index ya está definido en el campo expiresAt con expires: 0

export default mongoose.model('TapIntent', tapIntentSchema);

