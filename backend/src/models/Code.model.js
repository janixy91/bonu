import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const codeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 6,
      maxlength: 10,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    benefitName: {
      type: String,
      required: false, // Made optional for backward compatibility
      trim: true,
    },
    tarjetaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PromoCard',
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null until redeemed
    },
    expirationDate: {
      type: Date,
      required: false, // Made optional
    },
    used: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
codeSchema.index({ code: 1 });
codeSchema.index({ businessId: 1 });
codeSchema.index({ userId: 1 });
codeSchema.index({ id: 1 });

export default mongoose.model('Code', codeSchema);

