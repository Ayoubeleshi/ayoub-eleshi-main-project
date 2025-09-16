import { z } from 'zod';

export const subtaskSchema = z.object({
  id: z.string().uuid(),
  task_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'done']).default('not_started'),
  order_index: z.number().int().min(0).default(0),
  created_by: z.string().uuid().optional(),
  assigned_to: z.string().uuid().optional(),
  due_date: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const createSubtaskSchema = z.object({
  task_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'done']).default('not_started'),
  order_index: z.number().int().min(0).default(0),
  assigned_to: z.string().uuid().optional(),
  due_date: z.string().datetime().optional(),
});

export const updateSubtaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  description: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'done']).optional(),
  order_index: z.number().int().min(0).optional(),
  assigned_to: z.string().uuid().optional(),
  due_date: z.string().datetime().optional(),
});

export type Subtask = z.infer<typeof subtaskSchema>;
export type CreateSubtaskData = z.infer<typeof createSubtaskSchema>;
export type UpdateSubtaskData = z.infer<typeof updateSubtaskSchema>;
