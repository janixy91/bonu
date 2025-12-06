import mongoose from 'mongoose';

const stampHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      required: true,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    action: {
      type: String,
      enum: ['stamp', 'redeem'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('StampHistory', stampHistorySchema);

