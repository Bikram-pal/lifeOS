import mongoose from 'mongoose';
import { APP_CONSTANTS } from '../config/constants.js';

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
      default: null,
    },
    sourceDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(APP_CONSTANTS.TASK_STATUS),
      default: APP_CONSTANTS.TASK_STATUS.TODO,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(APP_CONSTANTS.TASK_PRIORITY),
      default: APP_CONSTANTS.TASK_PRIORITY.MEDIUM,
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    aiReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ user: 1, status: 1, dueDate: 1 });

export const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
