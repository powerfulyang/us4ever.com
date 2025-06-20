import { z } from 'zod'
import { BaseQuerySchema } from '@/dto/base.dto'

// 创建 Keep 的 DTO
export const createKeepSchema = z.object({
  content: z.string().min(1, '内容不能为空'),
  isPublic: z.boolean().default(false).optional(),
  tags: z.array(z.string()).default([]).optional(),
  category: z.string().default('default').optional(),
})

export type CreateKeepDTO = z.infer<typeof createKeepSchema>

// 更新 Keep 的 DTO
export const updateKeepSchema = z.object({
  content: z.string().min(1, '内容不能为空').optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  title: z.string().optional(),
  summary: z.string().optional(),
})

export type UpdateKeepDTO = z.infer<typeof updateKeepSchema>

// 查询 Keep 的 DTO
export const queryKeepSchema = BaseQuerySchema

export type QueryKeepDTO = z.infer<typeof queryKeepSchema>

// Keep 列表响应 DTO
export const keepListResponseSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    title: z.string(),
    summary: z.string(),
    content: z.string(),
    isPublic: z.boolean(),
    tags: z.array(z.string()),
    category: z.string(),
    views: z.number(),
    likes: z.number(),
    ownerId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })),
  nextCursor: z.string().optional(),
  total: z.number().optional(),
})

export type KeepListResponseDTO = z.infer<typeof keepListResponseSchema>
