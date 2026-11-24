import mongoose from 'mongoose';

const documentChunkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    metadata: {
      page: {
        type: Number,
        default: 1,
      },
      charCount: {
        type: Number,
        default: 0,
      },
      tokenEstimate: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

documentChunkSchema.index({ content: 'text' });
documentChunkSchema.index({ user: 1, document: 1 });

export const DocumentChunk =
  mongoose.models.DocumentChunk || mongoose.model('DocumentChunk', documentChunkSchema);
