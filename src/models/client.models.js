import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    contact_info: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Client = mongoose.model('Client', clientSchema);
