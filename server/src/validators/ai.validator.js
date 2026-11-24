import { z } from 'zod';

export const chatSchema = z.object({
  body: z.object({
    conversationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid conversation ID').optional(),
    prompt: z.string().min(1, 'Prompt is required').max(4000, 'Prompt too long'),
    documentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid document ID').nullable().optional(),
  }),
});

export const extractTasksSchema = z.object({
  body: z.object({
    text: z.string().optional(),
    documentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid document ID').nullable().optional(),
  }),
});

export const approveTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional().default(''),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
    dueDate: z.string().datetime().nullable().optional(),
    project: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID').nullable().optional(),
    aiReason: z.string().optional().default('Context-to-Action AI extraction'),
  }),
});
