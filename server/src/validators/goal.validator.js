import { z } from 'zod';
import { APP_CONSTANTS } from '../config/constants.js';

const goalStatusEnum = z.enum(
  Object.values(APP_CONSTANTS.GOAL_STATUS || {
    NOT_STARTED: 'NOT_STARTED',
    IN_PROGRESS: 'IN_PROGRESS',
    ACHIEVED: 'ACHIEVED',
    OVERDUE: 'OVERDUE',
  })
);

export const createGoalSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(150, 'Title too long'),
    description: z.string().optional().default(''),
    targetValue: z.number().min(1, 'Target must be at least 1'),
    currentValue: z.number().min(0).optional().default(0),
    unit: z.string().optional().default('%'),
    deadline: z.string().datetime().nullable().optional(),
    connectedProjects: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional().default([]),
    status: goalStatusEnum.optional().default('IN_PROGRESS'),
  }),
});

export const updateGoalSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(150).optional(),
    description: z.string().optional(),
    targetValue: z.number().min(1).optional(),
    currentValue: z.number().min(0).optional(),
    unit: z.string().optional(),
    deadline: z.string().datetime().nullable().optional(),
    connectedProjects: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
    status: goalStatusEnum.optional(),
  }),
});

export const updateProgressSchema = z.object({
  body: z.object({
    currentValue: z.number().min(0, 'Current value cannot be negative'),
  }),
});
