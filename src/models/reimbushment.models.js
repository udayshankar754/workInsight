import mongoose from 'mongoose';

const reimbushmentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
    },
    reason: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    userId : {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const Reimbushment = mongoose.model('Reimbushment', reimbushmentSchema);
