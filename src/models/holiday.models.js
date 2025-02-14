import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema(
  {
    
    date: {
      type: Date,
    },
    isHoliday : {
      type: Boolean,
      default: true,
    },
    holidayReason : {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Holiday = mongoose.model(
  'Holiday',
  holidaySchema
);
