import { z } from 'zod';
import { APP_CONSTANTS } from '../config/constants.js';

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(150, 'Title cannot exceed 150 characters'),
    description: z.string().optional().default(''),
    status: z.enum(Object.values(APP_CONSTANTS.PROJECT_STATUS)).optional().default(APP_CONSTANTS.PROJECT_STATUS.ACTIVE),
    color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Invalid hex color').optional().default('#6366F1'),
    milestones: z
      .array(
        z.object({
          title: z.string().min(1),
          dueDate: z.string().datetime().optional(),
          completed: z.boolean().optional().default(false),
        })
      )
      .optional()
      .default([]),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(150).optional(),
    description: z.string().optional(),
    status: z.enum(Object.values(APP_CONSTANTS.PROJECT_STATUS)).optional(),
    color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Invalid hex color').optional(),
    milestones: z
      .array(
        z.object({
          title: z.string().min(1),
          dueDate: z.string().datetime().optional(),
          completed: z.boolean().optional().default(false),
        })
      )
      .optional(),
  }),
});
