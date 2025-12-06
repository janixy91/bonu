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
      enum: ['unlimited', 'limited', 'stamp'],
      required: true,
    },
    limit: {
      type: Number,
      default: null,
      validate: {
        validator: function(value) {
          // limit is required only if type is 'limited'
          if (this.type === 'limited') {
            return value !== null && value > 0;
          }
          return value === null;
        },
        message: 'Limit must be a positive number for limited cards',
      },
    },
    remaining: {
      type: Number,
      default: function() {
        // Initialize remaining equal to limit for limited cards
        return this.type === 'limited' ? this.limit : null;
      },
      validate: {
        validator: function(value) {
          if (this.type === 'limited') {
            return value !== null && value >= 0;
          }
          return value === null;
        },
        message: 'Remaining must be a non-negative number for limited cards',
      },
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    soldOut: {
      type: Boolean,
      default: false,
      index: true,
    },
    benefitType: {
      type: String,
      required: function() {
        // benefitType is required only if type is not 'stamp'
        return this.type !== 'stamp';
      },
      trim: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Fields for stamp-type cards (replaces business.totalStamps and rewardText)
    totalStamps: {
      type: Number,
      default: null,
      validate: {
        validator: function(value) {
          // totalStamps is required only if type is 'stamp'
          if (this.type === 'stamp') {
            return value !== null && value > 0;
          }
          return value === null;
        },
        message: 'totalStamps must be a positive number for stamp cards',
      },
    },
    rewardText: {
      type: String,
      default: null,
      validate: {
        validator: function(value) {
          // rewardText is required only if type is 'stamp'
          if (this.type === 'stamp') {
            return value !== null && value.trim().length > 0;
          }
          return value === null;
        },
        message: 'rewardText is required for stamp cards',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
promoCardSchema.index({ businessId: 1, isDeleted: 1, active: 1 });
promoCardSchema.index({ businessId: 1, soldOut: 1 });

// Method to check if card is available
promoCardSchema.methods.isAvailable = function() {
  if (this.isDeleted || !this.active || this.soldOut) {
    return false;
  }
  
  if (this.expiresAt && this.expiresAt < new Date()) {
    return false;
  }
  
  if (this.type === 'limited' && this.remaining <= 0) {
    return false;
  }
  
  return true;
};

// Method to decrement remaining (with concurrency control)
promoCardSchema.methods.decrementRemaining = async function() {
  if (this.type !== 'limited') {
    throw new Error('Cannot decrement remaining for unlimited cards');
  }
  
  if (this.remaining <= 0) {
    throw new Error('Card is sold out');
  }
  
  // Use atomic operation to prevent race conditions
  const result = await mongoose.model('PromoCard').findOneAndUpdate(
    { _id: this._id, remaining: { $gt: 0 } },
    { 
      $inc: { remaining: -1 },
      $set: { soldOut: false } // Reset soldOut if we're adding stock
    },
    { new: true }
  );
  
  if (!result) {
    throw new Error('Failed to decrement remaining (concurrent update or sold out)');
  }
  
  // Check if remaining reached 0
  if (result.remaining === 0) {
    result.soldOut = true;
    result.active = false;
    await result.save();
  }
  
  return result;
};

export default mongoose.model('PromoCard', promoCardSchema);

