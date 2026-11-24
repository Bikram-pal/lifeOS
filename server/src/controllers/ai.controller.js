import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Task } from '../models/Task.js';
import { Document } from '../models/Document.js';
import { AIService } from '../services/ai.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ user: req.user._id })
      .populate('pinnedDocument', 'title originalFilename')
      .sort({ updatedAt: -1 });

    return sendSuccess(res, 200, 'Conversations retrieved', conversations);
  } catch (err) {
    next(err);
  }
};

export const getConversationMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('pinnedDocument', 'title originalFilename');

    if (!conversation) {
      return next(new AppError('Conversation not found', 404));
    }

    const messages = await Message.find({
      conversation: conversation._id,
      user: req.user._id,
    }).sort({ createdAt: 1 });

    return sendSuccess(res, 200, 'Messages retrieved', {
      conversation,
      messages,
    });
  } catch (err) {
    next(err);
  }
};

export const createConversation = async (req, res, next) => {
  try {
    const { title, pinnedDocument } = req.body;

    const conversation = await Conversation.create({
      user: req.user._id,
      title: title || 'New Intelligence Session',
      pinnedDocument: pinnedDocument || null,
    });

    const populated = await Conversation.findById(conversation._id).populate(
      'pinnedDocument',
      'title originalFilename'
    );

    return sendSuccess(res, 201, 'Conversation created', populated);
  } catch (err) {
    next(err);
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!conversation) {
      return next(new AppError('Conversation not found', 404));
    }

    await Message.deleteMany({ conversation: conversation._id });

    return sendSuccess(res, 200, 'Conversation deleted', { id: req.params.id });
  } catch (err) {
    next(err);
  }
};

export const chat = async (req, res, next) => {
  try {
    const { conversationId, prompt, documentId } = req.body;
    let conversation;

    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        user: req.user._id,
      });
    }

    if (!conversation) {
      const titlePrompt = prompt.length > 30 ? `${prompt.slice(0, 30)}...` : prompt;
      conversation = await Conversation.create({
        user: req.user._id,
        title: titlePrompt,
        pinnedDocument: documentId || null,
      });
    }

    // Save user message
    const userMsg = await Message.create({
      conversation: conversation._id,
      user: req.user._id,
      role: 'user',
      content: prompt,
    });

    // Get message history for context
    const history = await Message.find({ conversation: conversation._id })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean();

    // Call AI Service
    const aiResult = await AIService.chat({
      userId: req.user._id,
      conversationHistory: history,
      prompt,
      documentId: documentId || conversation.pinnedDocument,
    });

    // Save assistant message
    const assistantMsg = await Message.create({
      conversation: conversation._id,
      user: req.user._id,
      role: 'assistant',
      content: aiResult.content,
      sources: aiResult.sources || [],
    });

    // Update conversation timestamp
    conversation.updatedAt = new Date();
    await conversation.save();

    return sendSuccess(res, 200, 'AI response generated', {
      conversationId: conversation._id,
      message: assistantMsg,
      sources: aiResult.sources,
    });
  } catch (err) {
    next(err);
  }
};

export const extractTasks = async (req, res, next) => {
  try {
    const { text, documentId } = req.body;

    const tasks = await AIService.extractTasksFromContext({
      userId: req.user._id,
      text,
      documentId,
    });

    return sendSuccess(res, 200, 'Actionable tasks synthesized', tasks);
  } catch (err) {
    next(err);
  }
};

export const approveTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, project, aiReason } = req.body;

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      priority: priority || 'MEDIUM',
      dueDate: dueDate || null,
      project: project || null,
      aiGenerated: true,
      aiReason: aiReason || 'Approved from Context-to-Action engine',
      status: 'TODO',
    });

    const populatedTask = await Task.findById(task._id).populate('project', 'title color');

    return sendSuccess(res, 201, 'Actionable task created and scheduled', populatedTask);
  } catch (err) {
    next(err);
  }
};
