import mongoose from 'mongoose';

const bonusSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reason: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Bonus = mongoose.model('Bonus', bonusSchema);
