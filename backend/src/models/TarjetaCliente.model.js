import mongoose from 'mongoose';

const tarjetaClienteSchema = new mongoose.Schema(
  {
    tarjetaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PromoCard',
      required: true,
      index: true,
    },
    clienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    estado: {
      type: String,
      enum: ['activa', 'desactivada_por_bar', 'canjeada'],
      default: 'activa',
    },
    fechaAnadida: {
      type: Date,
      default: Date.now,
    },
    fechaCanje: {
      type: Date,
      default: null,
    },
    // Para tarjetas de sellos
    sellosActuales: {
      type: Number,
      default: 0,
      min: 0,
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

// Índice único para evitar duplicados
tarjetaClienteSchema.index({ tarjetaId: 1, clienteId: 1 }, { unique: true });
tarjetaClienteSchema.index({ clienteId: 1, estado: 1 });

export default mongoose.model('TarjetaCliente', tarjetaClienteSchema);

