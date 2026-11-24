import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

export const getTasks = async (req, res, next) => {
  try {
    const { status, priority, project, search } = req.query;
    const filter = { user: req.user._id };

    if (status) {
      filter.status = status;
    }
    if (priority) {
      filter.priority = priority;
    }
    if (project) {
      filter.project = project;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter)
      .populate('project', 'title color')
      .sort({ dueDate: 1, createdAt: -1 });

    return sendSuccess(res, 200, 'Tasks retrieved successfully', tasks);
  } catch (err) {
    next(err);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id }).populate(
      'project',
      'title color'
    );
    if (!task) {
      return next(new AppError('Task not found', 404));
    }
    return sendSuccess(res, 200, 'Task retrieved successfully', task);
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, project } = req.body;

    if (project) {
      const existingProject = await Project.findOne({ _id: project, user: req.user._id });
      if (!existingProject) {
        return next(new AppError('Associated project not found or unauthorized', 404));
      }
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      project: project || null,
    });

    const populatedTask = await Task.findById(task._id).populate('project', 'title color');
    return sendSuccess(res, 201, 'Task created successfully', populatedTask);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, project } = req.body;

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    if (project !== undefined) {
      if (project) {
        const existingProject = await Project.findOne({ _id: project, user: req.user._id });
        if (!existingProject) {
          return next(new AppError('Associated project not found or unauthorized', 404));
        }
        task.project = project;
      } else {
        task.project = null;
      }
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    await task.save();

    const populatedTask = await Task.findById(task._id).populate('project', 'title color');
    return sendSuccess(res, 200, 'Task updated successfully', populatedTask);
  } catch (err) {
    next(err);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status },
      { new: true, runValidators: true }
    ).populate('project', 'title color');

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    return sendSuccess(res, 200, 'Task status updated successfully', task);
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return next(new AppError('Task not found', 404));
    }
    return sendSuccess(res, 200, 'Task deleted successfully', { id: req.params.id });
  } catch (err) {
    next(err);
  }
};
