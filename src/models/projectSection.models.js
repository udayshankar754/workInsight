import mongoose from 'mongoose';

const projectSectionSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    projectInfo: {
      type: String,
    },
    projectDocs: {
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
  },
  {
    timestamps: true,
  }
);

export const ProjectSection = mongoose.model(
  'ProjectSection',
  projectSectionSchema
);
