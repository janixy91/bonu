import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    currentStamps: {
      type: Number,
      default: 0,
      min: 0,
    },
    redeemedRewards: [
      {
        type: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate cards
cardSchema.index({ userId: 1, businessId: 1 }, { unique: true });

export default mongoose.model('Card', cardSchema);

