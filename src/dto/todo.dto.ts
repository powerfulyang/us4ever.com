import { z } from 'zod'

// 创建 Todo 的 DTO
export const createTodoSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200个字符'),
  content: z.string().optional(),
  status: z.boolean().default(false),
  priority: z.number().int().min(0).max(3).default(0),
  dueDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  isPublic: z.boolean().default(false),
  pinned: z.boolean().default(false),
  category: z.string().default('default'),
})

export type CreateTodoDTO = z.infer<typeof createTodoSchema>

// 更新 Todo 的 DTO
export const updateTodoSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200个字符').optional(),
  content: z.string().optional(),
  status: z.boolean().optional(),
  priority: z.number().int().min(0).max(3).optional(),
  dueDate: z.string().datetime().transform(val => val ? new Date(val) : null).optional(),
  isPublic: z.boolean().optional(),
  pinned: z.boolean().optional(),
  category: z.string().optional(),
})

export type UpdateTodoDTO = z.infer<typeof updateTodoSchema>

// 查询 Todo 的 DTO
export const queryTodoSchema = z.object({
  status: z.boolean().optional(),
  priority: z.number().int().min(0).max(3).optional(),
  pinned: z.boolean().optional(),
  category: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

export type QueryTodoDTO = z.infer<typeof queryTodoSchema>

// Todo 响应 DTO
export const todoResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string().nullable(),
  status: z.boolean(),
  priority: z.number(),
  dueDate: z.date().nullable(),
  isPublic: z.boolean(),
  pinned: z.boolean(),
  category: z.string(),
  ownerId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type TodoResponseDTO = z.infer<typeof todoResponseSchema>
