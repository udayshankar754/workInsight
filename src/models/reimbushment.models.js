import mongoose from 'mongoose';

const reimbushmentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      default: 0,
    },
    billImage: {
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

export const Reimbushment = mongoose.model('Reimbushment', reimbushmentSchema);
