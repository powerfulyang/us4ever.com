/**
 * Moment Service 类型定义
 */
import type { Prisma } from '@prisma/client'

/**
 * 动态图片关联接口
 */
export interface MomentImage {
  id: string
  sort: number
  name?: string
}

/**
 * 动态视频关联接口
 */
export interface MomentVideo extends MomentImage {}

/**
 * 创建动态的输入参数接口
 */
export interface CreateMomentInput extends Omit<Prisma.MomentCreateManyInput, 'ownerId'> {
  images?: MomentImage[]
  videos?: MomentVideo[]
}

/**
 * 更新动态的输入参数接口
 */
export interface UpdateMomentInput extends CreateMomentInput {
  id: string
}

/**
 * 查询动态列表的输入参数接口
 */
export interface ListMomentInput {
  userIds?: string[]
  userId?: string
  isPublic?: boolean
  category?: string
  take?: number
  cursor?: string
}

/**
 * 查询动态列表的输入参数接口(带游标)
 */
export interface FindMomentsByCursorInput {
  userIds: string[]
  limit: number
  cursor?: string
  category?: string
  visibility?: 'all' | 'public' | 'private'
}

/**
 * Moment 关键词搜索命中项
 */
export interface MomentSearchHit {
  id: string
  score: number
  similarity?: number
  content: string
  isPublic: boolean
  category: string
  createdAt: Date
  updatedAt: Date
  highlight_content?: string
  [key: string]: any
}
