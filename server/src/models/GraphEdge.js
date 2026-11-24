import mongoose from 'mongoose';

const graphEdgeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    edgeId: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    target: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
    animated: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

graphEdgeSchema.index({ user: 1, edgeId: 1 }, { unique: true });

export const GraphEdge =
  mongoose.models.GraphEdge || mongoose.model('GraphEdge', graphEdgeSchema);
