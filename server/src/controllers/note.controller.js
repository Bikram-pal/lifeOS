import { Note } from '../models/Note.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

export const getNotes = async (req, res, next) => {
  try {
    const { search, tag } = req.query;
    const filter = { user: req.user._id };

    if (tag) {
      filter.tags = tag;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const notes = await Note.find(filter)
      .populate('sourceDocument', 'title originalFilename')
      .sort({ updatedAt: -1 });

    return sendSuccess(res, 200, 'Notes retrieved successfully', notes);
  } catch (err) {
    next(err);
  }
};

export const getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id }).populate(
      'sourceDocument',
      'title originalFilename'
    );
    if (!note) {
      return next(new AppError('Note not found', 404));
    }
    return sendSuccess(res, 200, 'Note retrieved successfully', note);
  } catch (err) {
    next(err);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const { title, content, tags, sourceDocument } = req.body;

    const note = await Note.create({
      user: req.user._id,
      title,
      content: content || '',
      tags: tags || [],
      sourceDocument: sourceDocument || null,
    });

    const populatedNote = await Note.findById(note._id).populate(
      'sourceDocument',
      'title originalFilename'
    );

    return sendSuccess(res, 201, 'Note created successfully', populatedNote);
  } catch (err) {
    next(err);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const { title, content, tags, sourceDocument } = req.body;

    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return next(new AppError('Note not found', 404));
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (sourceDocument !== undefined) note.sourceDocument = sourceDocument || null;

    await note.save();

    const populatedNote = await Note.findById(note._id).populate(
      'sourceDocument',
      'title originalFilename'
    );

    return sendSuccess(res, 200, 'Note updated successfully', populatedNote);
  } catch (err) {
    next(err);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return next(new AppError('Note not found', 404));
    }
    return sendSuccess(res, 200, 'Note deleted successfully', { id: req.params.id });
  } catch (err) {
    next(err);
  }
};
