import { z } from 'zod';

export const createNoteSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
    content: z.string().optional().default(''),
    tags: z.array(z.string()).optional().default([]),
    sourceDocument: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid document ID').nullable().optional(),
  }),
});

export const updateNoteSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().optional(),
    tags: z.array(z.string()).optional(),
    sourceDocument: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid document ID').nullable().optional(),
  }),
});
