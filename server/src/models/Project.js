import mongoose from 'mongoose';
import { APP_CONSTANTS } from '../config/constants.js';

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  dueDate: {
    type: Date,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(APP_CONSTANTS.PROJECT_STATUS),
      default: APP_CONSTANTS.PROJECT_STATUS.ACTIVE,
      index: true,
    },
    color: {
      type: String,
      default: '#6366F1',
    },
    milestones: [milestoneSchema],
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ user: 1, status: 1 });

export const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
