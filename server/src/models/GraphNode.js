import mongoose from 'mongoose';
import { APP_CONSTANTS } from '../config/constants.js';

const graphNodeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    nodeId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(APP_CONSTANTS.GRAPH_NODE_TYPES || {
        DOCUMENT: 'document',
        NOTE: 'note',
        TOPIC: 'topic',
        PROJECT: 'project',
        TASK: 'task',
        GOAL: 'goal',
      }),
      required: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

graphNodeSchema.index({ user: 1, nodeId: 1 }, { unique: true });

export const GraphNode =
  mongoose.models.GraphNode || mongoose.model('GraphNode', graphNodeSchema);
