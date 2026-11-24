import mongoose from 'mongoose';
import { APP_CONSTANTS } from '../config/constants.js';

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    targetValue: {
      type: Number,
      required: [true, 'Target value is required'],
      min: [1, 'Target value must be at least 1'],
    },
    currentValue: {
      type: Number,
      default: 0,
      min: [0, 'Current value cannot be negative'],
    },
    unit: {
      type: String,
      trim: true,
      default: '%',
    },
    deadline: {
      type: Date,
      default: null,
    },
    connectedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
    ],
    status: {
      type: String,
      enum: Object.values(APP_CONSTANTS.GOAL_STATUS || {
        NOT_STARTED: 'NOT_STARTED',
        IN_PROGRESS: 'IN_PROGRESS',
        ACHIEVED: 'ACHIEVED',
        OVERDUE: 'OVERDUE',
      }),
      default: 'IN_PROGRESS',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

goalSchema.index({ user: 1, status: 1 });

export const Goal = mongoose.models.Goal || mongoose.model('Goal', goalSchema);
