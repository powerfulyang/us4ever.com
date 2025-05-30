import type { Prisma } from '@prisma/client'
import type { BaseListFilter, BaseUpdateInput } from '@/types/common'
import { HTTPException } from 'hono/http-exception'
import { db } from '@/server/db'

/**
 * 笔记查询时包含的关联数据
 */
export const keepInclude = {
  owner: true,
} as const

/**
 * 笔记资源类型
 */
export type KeepWithIncludes = Prisma.KeepGetPayload<{
  include: typeof keepInclude
}>

/**
 * 创建笔记的输入参数接口
 */
interface CreateKeepInput extends Omit<Prisma.KeepCreateInput, 'owner'> {
  ownerId: string
  content: string
  title?: string
  summary?: string
  isPublic?: boolean
  tags?: Prisma.InputJsonValue
  category?: string
  extraData?: Prisma.InputJsonValue
}

/**
 * 更新笔记的输入参数接口
 */
interface UpdateKeepInput extends BaseUpdateInput {
  ownerId: string
  content: string
  title?: string
  summary?: string
  isPublic?: boolean
  tags?: Prisma.InputJsonValue
  category?: string
  extraData?: Prisma.InputJsonValue
}

/**
 * 查询笔记列表的输入参数接口
 */
interface ListKeepInput extends BaseListFilter {
  /** 每页数量 */
  take?: number
  /** 游标，用于分页 */
  cursor?: string
  /** 分类 */
  category?: string
  /** 排序方式 */
  orderBy?: {
    field: 'createdAt' | 'updatedAt' | 'views'
    direction: 'asc' | 'desc'
  }
}

/**
 * 分页查询笔记列表
 * @param params 查询参数
 * @param params.userIds 用户ID列表
 * @param params.category 笔记分类
 * @param params.take 每页数量
 * @param params.cursor 游标ID
 * @param params.orderBy 排序方式
 * @returns 笔记列表和下一页游标
 */
export async function listKeeps({
  userIds,
  take = 10,
  cursor,
  category,
  orderBy = { field: 'createdAt', direction: 'desc' },
}: ListKeepInput) {
  const items = await db.keep.findMany({
    include: keepInclude,
    where: {
      OR: [
        {
          ownerId: {
            in: userIds,
          },
          ...(category ? { category } : {}),
        },
        { isPublic: true, ...(category ? { category } : {}) },
      ],
    },
    orderBy: {
      [orderBy.field]: orderBy.direction,
    },
    take: take + 1, // 多取一条用于判断是否还有更多数据
    ...(cursor ? { cursor: { id: cursor } } : {}),
  })

  const hasMore = items.length > take
  const data = items.slice(0, take)
  const nextCursor = hasMore ? items[take - 1]?.id : undefined

  return {
    items: data,
    nextCursor,
    hasMore,
  }
}

/**
 * 创建新的笔记
 * @param input 创建笔记的参数
 * @returns 创建的笔记
 */
export async function createKeep(input: CreateKeepInput) {
  const {
    ownerId,
    content,
    title = '',
    summary = '',
    isPublic = false,
    tags = [],
    category = 'default',
    extraData = {},
  } = input

  return db.keep.create({
    include: keepInclude,
    data: {
      content,
      title,
      summary,
      isPublic,
      tags,
      category,
      extraData,
      owner: {
        connect: {
          id: ownerId,
        },
      },
    },
  })
}

/**
 * 更新笔记内容
 * @param input 更新笔记的参数
 * @returns 更新后的笔记
 */
export async function updateKeep(input: UpdateKeepInput) {
  const {
    id,
    ownerId,
    content,
    title,
    summary,
    isPublic,
    tags,
    category,
    extraData,
  } = input

  return db.keep.update({
    include: keepInclude,
    where: {
      id,
      ownerId,
    },
    data: {
      content,
      ...(title !== undefined ? { title } : {}),
      ...(summary !== undefined ? { summary } : {}),
      ...(isPublic !== undefined ? { isPublic } : {}),
      ...(tags !== undefined ? { tags } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(extraData !== undefined ? { extraData } : {}),
    },
  })
}

/**
 * 根据ID获取笔记
 * @param id 笔记ID
 * @param filter 查询过滤条件
 * @param filter.userIds 用户ID列表
 * @returns 笔记详情
 */
export async function getKeepById(id: string, { userIds }: BaseListFilter) {
  const keep = await db.keep.findFirst({
    include: keepInclude,
    where: {
      id,
      OR: [
        {
          ownerId: {
            in: userIds,
          },
        },
        { isPublic: true },
      ],
    },
  })

  if (!keep) {
    throw new HTTPException(404, { message: '笔记不存在或无权访问' })
  }

  return keep
}

/**
 * 增加笔记浏览次数
 * @param id 笔记ID
 * @returns 更新后的笔记
 */
export async function incrementKeepViews(id: string) {
  return db.keep.update({
    include: keepInclude,
    where: { id },
    data: { views: { increment: 1 } },
  })
}

/**
 * 删除笔记
 * @param id 笔记ID
 * @param ownerId 所有者ID
 * @returns 删除的笔记
 */
export async function deleteKeep(id: string, ownerId: string) {
  return db.keep.delete({
    include: keepInclude,
    where: {
      id,
      ownerId,
    },
  })
}
