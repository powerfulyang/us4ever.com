import { z } from 'zod'
import { BaseCategoryField, BaseQuerySchema } from '@/dto/base.dto'

// 创建 Keep 的 DTO
export const createKeepSchema = z.object({
  content: z.string().min(1, '内容不能为空'),
  isPublic: z.boolean().default(false).optional(),
  tags: z.array(z.string()).default([]).optional(),
  category: BaseCategoryField,
})

export type CreateKeepDTO = z.infer<typeof createKeepSchema>

// 更新 Keep 的 DTO
export const updateKeepSchema = z.object({
  content: z.string().min(1, '内容不能为空').optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  category: BaseCategoryField,
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

// 分页查询 Keep 的 DTO（使用 page/pageSize）
export const queryKeepPageSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
  category: BaseCategoryField,
})

export type QueryKeepPageDTO = z.infer<typeof queryKeepPageSchema>

// 分页响应 DTO
export const keepPageResponseSchema = z.object({
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
    owner: z.object({
      id: z.string(),
      nickname: z.string(),
      avatar: z.string().nullable(),
    }),
  })),
  total: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
})

export type KeepPageResponseDTO = z.infer<typeof keepPageResponseSchema>

// 语义搜索 DTO
export const semanticSearchSchema = z.object({
  query: z.string().min(1, 'query不能为空'),
  topK: z.number().int().min(1).max(50).default(10),
})

export type SemanticSearchDTO = z.infer<typeof semanticSearchSchema>
