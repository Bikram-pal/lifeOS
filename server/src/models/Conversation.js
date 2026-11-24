import mongoose from 'mongoose';
import { APP_CONSTANTS } from '../config/constants.js';

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'New Intelligence Session',
    },
    model: {
      type: String,
      default: APP_CONSTANTS.DEFAULT_GROQ_MODEL || 'llama-3.3-70b-versatile',
    },
    pinnedDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ user: 1, updatedAt: -1 });

export const Conversation =
  mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
