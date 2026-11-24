import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Aggregate task counts per project
    const projectIds = projects.map((p) => p._id);
    const taskCounts = await Task.aggregate([
      { $match: { user: req.user._id, project: { $in: projectIds } } },
      {
        $group: {
          _id: '$project',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] },
          },
        },
      },
    ]);

    const countMap = {};
    taskCounts.forEach((c) => {
      countMap[c._id.toString()] = {
        total: c.total,
        completed: c.completed,
      };
    });

    const enrichedProjects = projects.map((p) => {
      const stats = countMap[p._id.toString()] || { total: 0, completed: 0 };
      const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
      return {
        ...p.toObject(),
        taskStats: {
          ...stats,
          progress,
        },
      };
    });

    return sendSuccess(res, 200, 'Projects retrieved successfully', enrichedProjects);
  } catch (err) {
    next(err);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    const tasks = await Task.find({ project: project._id, user: req.user._id }).sort({
      dueDate: 1,
      createdAt: -1,
    });

    return sendSuccess(res, 200, 'Project retrieved successfully', {
      ...project.toObject(),
      tasks,
    });
  } catch (err) {
    next(err);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { title, description, status, color, milestones } = req.body;

    const project = await Project.create({
      user: req.user._id,
      title,
      description,
      status,
      color,
      milestones,
    });

    return sendSuccess(res, 201, 'Project created successfully', {
      ...project.toObject(),
      taskStats: { total: 0, completed: 0, progress: 0 },
    });
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { title, description, status, color, milestones } = req.body;

    const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;
    if (color !== undefined) project.color = color;
    if (milestones !== undefined) project.milestones = milestones;

    await project.save();

    return sendSuccess(res, 200, 'Project updated successfully', project);
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Unassign associated tasks rather than deleting them
    await Task.updateMany(
      { project: req.params.id, user: req.user._id },
      { $set: { project: null } }
    );

    return sendSuccess(res, 200, 'Project deleted successfully', { id: req.params.id });
  } catch (err) {
    next(err);
  }
};
