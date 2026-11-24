import { Goal } from '../models/Goal.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

export const getGoals = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { user: req.user._id };

    if (status) {
      filter.status = status;
    }

    const goals = await Goal.find(filter)
      .populate('connectedProjects', 'title color')
      .sort({ createdAt: -1 });

    const enrichedGoals = goals.map((g) => {
      const progress =
        g.targetValue > 0
          ? Math.min(Math.round((g.currentValue / g.targetValue) * 100), 100)
          : 0;

      // Auto update status if achieved or overdue
      let autoStatus = g.status;
      if (progress >= 100 && g.status !== 'ACHIEVED') {
        autoStatus = 'ACHIEVED';
      } else if (
        g.deadline &&
        new Date(g.deadline) < new Date() &&
        progress < 100 &&
        g.status !== 'OVERDUE'
      ) {
        autoStatus = 'OVERDUE';
      }

      return {
        ...g.toObject(),
        status: autoStatus,
        progress,
      };
    });

    return sendSuccess(res, 200, 'Goals retrieved successfully', enrichedGoals);
  } catch (err) {
    next(err);
  }
};

export const getGoalById = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id }).populate(
      'connectedProjects',
      'title color'
    );
    if (!goal) {
      return next(new AppError('Goal not found', 404));
    }

    const progress =
      goal.targetValue > 0
        ? Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100)
        : 0;

    return sendSuccess(res, 200, 'Goal retrieved', { ...goal.toObject(), progress });
  } catch (err) {
    next(err);
  }
};

export const createGoal = async (req, res, next) => {
  try {
    const {
      title,
      description,
      targetValue,
      currentValue,
      unit,
      deadline,
      connectedProjects,
      status,
    } = req.body;

    const goal = await Goal.create({
      user: req.user._id,
      title,
      description: description || '',
      targetValue,
      currentValue: currentValue || 0,
      unit: unit || '%',
      deadline: deadline || null,
      connectedProjects: connectedProjects || [],
      status: status || 'IN_PROGRESS',
    });

    const populated = await Goal.findById(goal._id).populate(
      'connectedProjects',
      'title color'
    );

    const progress =
      goal.targetValue > 0
        ? Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100)
        : 0;

    return sendSuccess(res, 201, 'Goal created successfully', {
      ...populated.toObject(),
      progress,
    });
  } catch (err) {
    next(err);
  }
};

export const updateGoal = async (req, res, next) => {
  try {
    const {
      title,
      description,
      targetValue,
      currentValue,
      unit,
      deadline,
      connectedProjects,
      status,
    } = req.body;

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return next(new AppError('Goal not found', 404));
    }

    if (title !== undefined) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (targetValue !== undefined) goal.targetValue = targetValue;
    if (currentValue !== undefined) goal.currentValue = currentValue;
    if (unit !== undefined) goal.unit = unit;
    if (deadline !== undefined) goal.deadline = deadline || null;
    if (connectedProjects !== undefined) goal.connectedProjects = connectedProjects;
    if (status !== undefined) goal.status = status;

    // Check achievement status
    if (goal.currentValue >= goal.targetValue) {
      goal.status = 'ACHIEVED';
    }

    await goal.save();

    const populated = await Goal.findById(goal._id).populate(
      'connectedProjects',
      'title color'
    );

    const progress =
      goal.targetValue > 0
        ? Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100)
        : 0;

    return sendSuccess(res, 200, 'Goal updated successfully', {
      ...populated.toObject(),
      progress,
    });
  } catch (err) {
    next(err);
  }
};

export const updateGoalProgress = async (req, res, next) => {
  try {
    const { currentValue } = req.body;

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return next(new AppError('Goal not found', 404));
    }

    goal.currentValue = currentValue;
    if (goal.currentValue >= goal.targetValue) {
      goal.status = 'ACHIEVED';
    } else if (goal.status === 'ACHIEVED' && goal.currentValue < goal.targetValue) {
      goal.status = 'IN_PROGRESS';
    }

    await goal.save();

    const progress =
      goal.targetValue > 0
        ? Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100)
        : 0;

    return sendSuccess(res, 200, 'Goal progress updated', {
      ...goal.toObject(),
      progress,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return next(new AppError('Goal not found', 404));
    }
    return sendSuccess(res, 200, 'Goal deleted successfully', { id: req.params.id });
  } catch (err) {
    next(err);
  }
};
