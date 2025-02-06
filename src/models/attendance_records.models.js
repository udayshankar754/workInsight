import mongoose from 'mongoose';

const attandanceRecordSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectSection',
    },
    date: {
      type: Date,
    },
    loginTime: {
      type: String,
    },
    logoutTime: {
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
    workDetails: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const AttandanceRecord = mongoose.model(
  'AttandanceRecord',
  attandanceRecordSchema
);
