import fs from 'fs';
import { Document } from '../models/Document.js';
import { DocumentChunk } from '../models/DocumentChunk.js';
import { extractTextFromFile, chunkText } from '../utils/textExtractor.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

export const getDocuments = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = { user: req.user._id };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { originalFilename: { $regex: search, $options: 'i' } },
      ];
    }

    const documents = await Document.find(filter).sort({ createdAt: -1 });
    return sendSuccess(res, 200, 'Documents retrieved successfully', documents);
  } catch (err) {
    next(err);
  }
};

export const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!document) {
      return next(new AppError('Document not found', 404));
    }

    const chunks = await DocumentChunk.find({
      document: document._id,
      user: req.user._id,
    })
      .sort({ chunkIndex: 1 })
      .limit(20);

    return sendSuccess(res, 200, 'Document retrieved successfully', {
      ...document.toObject(),
      previewChunks: chunks,
    });
  } catch (err) {
    next(err);
  }
};

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please provide a file to upload.', 400));
    }

    const file = req.file;
    const title = req.body.title?.trim() || file.originalname.replace(/\.[^/.]+$/, '');

    // Create document record
    const doc = await Document.create({
      user: req.user._id,
      title,
      originalFilename: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype || 'application/octet-stream',
      status: 'PROCESSING',
    });

    try {
      // Extract text
      const { text, pages } = await extractTextFromFile(file.path, file.mimetype);
      const textChunks = chunkText(text);

      if (textChunks.length > 0) {
        const chunkDocs = textChunks.map((chunk, index) => ({
          user: req.user._id,
          document: doc._id,
          chunkIndex: index,
          content: chunk.content,
          metadata: {
            page: Math.min(Math.floor((index / textChunks.length) * pages) + 1, pages),
            charCount: chunk.charCount,
            tokenEstimate: chunk.tokenEstimate,
          },
        }));

        await DocumentChunk.insertMany(chunkDocs);
      }

      doc.status = 'READY';
      doc.chunkCount = textChunks.length;
      await doc.save();

      return sendSuccess(res, 201, 'Document uploaded and indexed successfully', doc);
    } catch (extractErr) {
      console.error('[Document Indexing Error]', extractErr);
      doc.status = 'FAILED';
      await doc.save();
      return sendSuccess(res, 201, 'Document uploaded, but text parsing failed', doc);
    }
  } catch (err) {
    next(err);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!document) {
      return next(new AppError('Document not found', 404));
    }

    // Delete chunks
    await DocumentChunk.deleteMany({ document: document._id, user: req.user._id });

    // Remove file on disk if exists
    if (document.filePath && fs.existsSync(document.filePath)) {
      try {
        fs.unlinkSync(document.filePath);
      } catch (e) {
        console.warn('[File unlink warning]', e.message);
      }
    }

    await Document.deleteOne({ _id: document._id });

    return sendSuccess(res, 200, 'Document deleted successfully', { id: req.params.id });
  } catch (err) {
    next(err);
  }
};
