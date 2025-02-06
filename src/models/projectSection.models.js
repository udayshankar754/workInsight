import mongoose from 'mongoose';
import {
  project_status_enum,
} from '../utils/TypeEnum.js';

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
    isCompleted: {
      type: Boolean,
      default: false,
    },
    projectStatus: {
      type: String,
      enum: project_status_enum,
      default: 'Pending',
    },
    projectDeadline : {
      type: Date,
    },
    projectPriority : {
      type : Number,
    }
  },
  {
    timestamps: true,
  }
);

export const ProjectSection = mongoose.model(
  'ProjectSection',
  projectSectionSchema
);
