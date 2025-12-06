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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: ['stamp'],
      default: 'stamp',
    },
    totalStamps: {
      type: Number,
      required: true,
      min: 1,
    },
    rewardText: {
      type: String,
      required: true,
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
  },
  {
    timestamps: true,
  }
);

promoCardSchema.index({ businessId: 1, isDeleted: 1 });

export default mongoose.model('PromoCard', promoCardSchema);


