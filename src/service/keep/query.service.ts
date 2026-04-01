import type { Prisma } from '@prisma/client'
/**
 * Keep 查询服务 - 分页和列表查询
 */
import type { QueryKeepDTO } from '@/dto/keep.dto'
import { db } from '@/server/db'
import { getCursor } from '@/service/index'
import { keepInclude } from './core.service'

import { buildKeepWhereClause } from './where-clause'

/**
 * 查找公开列表
 */
export async function findPublicList() {
  return db.keep.findMany({
    where: {
      isPublic: true,
    },
    select: {
      id: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })
}

/**
 * 查找用户可访问的列表（游标分页）
 */
export async function findAccessibleList(query: QueryKeepDTO, userIds: string[]) {
  const { limit = 10, cursor, category, visibility = 'all' } = query

  const items = await db.keep.findMany({
    take: limit + 1,
    where: buildKeepWhereClause({ userIds, category, visibility }),
    cursor: getCursor(cursor),
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      owner: {
        select: {
          id: true,
          nickname: true,
          avatar: true,
        },
      },
    },
  })

  let nextCursor: string | undefined
  if (items.length > limit) {
    const nextItem = items.pop()
    nextCursor = nextItem!.id
  }

  return {
    items,
    nextCursor,
  }
}

/**
 * 分页查找用户可访问的列表
 */
export async function findAccessiblePage(
  query: { page: number, pageSize: number, category?: string, visibility?: 'all' | 'public' | 'private' },
  userIds: string[],
) {
  const { page, pageSize, category, visibility = 'all' } = query
  const skip = (page - 1) * pageSize

  const whereClause = buildKeepWhereClause({ userIds, category, visibility })

  // 获取总数
  const total = await db.keep.count({
    where: whereClause,
  })

  // 获取分页数据
  const items = await db.keep.findMany({
    skip,
    take: pageSize,
    where: whereClause,
    orderBy: {
      createdAt: 'desc',
    },
    include: keepInclude,
  })

  const totalPages = Math.ceil(total / pageSize)

  return {
    items,
    total,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

/**
 * 获取笔记分类列表
 */
export async function getCategories(userIds: string[], visibility: 'all' | 'public' | 'private' = 'all') {
  const categories = await db.keep.findMany({
    select: {
      category: true,
    },
    where: buildKeepWhereClause({ userIds, visibility }),
    distinct: ['category'],
  })
  return categories.map(category => category.category)
}

/**
 * 根据标签查询
 */
export async function findByTag(
  tag: string,
  userIds: string[],
  options: { page?: number, pageSize?: number, onlyPublic?: boolean } = {},
) {
  const { page = 1, pageSize = 10, onlyPublic = false } = options
  const skip = (page - 1) * pageSize

  // 构建 where 条件
  const whereClause: Prisma.KeepWhereInput = {
    tags: {
      array_contains: [tag],
    },
    ...(onlyPublic
      ? { isPublic: true }
      : {
          OR: [
            { ownerId: { in: userIds } },
            { isPublic: true },
          ],
        }),
  }

  // 获取总数
  const total = await db.keep.count({
    where: whereClause,
  })

  // 获取分页数据
  const items = await db.keep.findMany({
    skip,
    take: pageSize,
    where: whereClause,
    orderBy: {
      createdAt: 'desc',
    },
    include: keepInclude,
  })

  const totalPages = Math.ceil(total / pageSize)

  return {
    items,
    total,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}
