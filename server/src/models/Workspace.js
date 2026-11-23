import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      default: 'Personal Workspace',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isDefault: {
      type: Boolean,
      default: true,
    },
    settings: {
      defaultAiModel: {
        type: String,
        default: 'llama-3.3-70b-versatile',
      },
      ragChunkSize: {
        type: Number,
        default: 500,
      },
      ragOverlap: {
        type: Number,
        default: 100,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Workspace = mongoose.models.Workspace || mongoose.model('Workspace', workspaceSchema);
