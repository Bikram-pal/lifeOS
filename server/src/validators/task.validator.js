import { z } from 'zod';
import { APP_CONSTANTS } from '../config/constants.js';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
    description: z.string().optional().default(''),
    status: z.enum(Object.values(APP_CONSTANTS.TASK_STATUS)).optional().default(APP_CONSTANTS.TASK_STATUS.TODO),
    priority: z.enum(Object.values(APP_CONSTANTS.TASK_PRIORITY)).optional().default(APP_CONSTANTS.TASK_PRIORITY.MEDIUM),
    dueDate: z.string().datetime().nullable().optional(),
    project: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID').nullable().optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    status: z.enum(Object.values(APP_CONSTANTS.TASK_STATUS)).optional(),
    priority: z.enum(Object.values(APP_CONSTANTS.TASK_PRIORITY)).optional(),
    dueDate: z.string().datetime().nullable().optional(),
    project: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID').nullable().optional(),
  }),
});

export const updateTaskStatusSchema = z.object({
  body: z.object({
    status: z.enum(Object.values(APP_CONSTANTS.TASK_STATUS)),
  }),
});
