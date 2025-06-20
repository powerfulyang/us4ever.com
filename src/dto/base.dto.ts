import { z } from 'zod'

export const BaseQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  cursor: z.string().optional().transform(val => !val ? undefined : val),
  category: z.string().optional(),
})

export const BasePrimaryKeySchema = z.object({
  id: z.string().min(1, 'id不能为空'),
})

export const UpdateViewsSchema = z.object({
  updateViews: z.boolean().default(false),
})

export const QuerySearchSchema = z.object({
  query: z.string().min(1, 'query不能为空'),
})
