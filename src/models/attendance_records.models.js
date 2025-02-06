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
    isHoliday : {
      type: Boolean,
      default: false,
    },
    holidayReason : {
      type: String,
    },
    loginTime: {
      type: String,
    },
    loginLat: {
      type: Number
    },
    loginLang: {
      type: Number
    },
    logoutLat: {
      type: Number
    },
    logoutLang: {
      type: Number
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
