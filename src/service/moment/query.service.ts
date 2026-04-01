/**
 * Moment 查询服务 - 分页和列表查询
 */
import type { Prisma } from '@prisma/client'
import { db } from '@/server/db'
import { imageInclude, videoInclude } from '@/service/asset.service'
import { getCursor } from '@/service/index'
import { transformMomentListResponse } from './transformer'
import { buildMomentWhereClause } from './where-clause'

/**
 * 查询动态列表
 */
export async function listMoments({
  userIds,
  category,
  take,
  cursor,
}: {
  userIds: string[]
  category?: string
  take?: number
  cursor?: string
}) {
  const list = await db.moment.findMany({
    include: {
      images: {
        include: {
          image: {
            include: imageInclude,
          },
        },
        orderBy: {
          sort: 'asc',
        },
      },
      videos: {
        include: {
          video: {
            include: videoInclude,
          },
        },
        orderBy: {
          sort: 'asc',
        },
      },
      owner: true,
    },
    where: {
      OR: [
        {
          ownerId: {
            in: userIds,
          },
          category,
        },
        { isPublic: true, category },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
    take,
    cursor: getCursor(cursor),
  })

  return transformMomentListResponse(list)
}

/**
 * 使用游标分页查询动态列表
 */
export async function findMomentsByCursor({
  userIds,
  limit,
  cursor,
  category,
  visibility = 'all',
}: {
  userIds: string[]
  limit: number
  cursor?: string
  category?: string
  visibility?: 'all' | 'public' | 'private'
}) {
  const where = buildMomentWhereClause({ userIds, category, visibility })
  const items = await db.moment.findMany({
    include: {
      images: {
        include: {
          image: {
            include: imageInclude,
          },
        },
        orderBy: {
          sort: 'asc',
        },
      },
      videos: {
        include: {
          video: {
            include: videoInclude,
          },
        },
        orderBy: {
          sort: 'asc',
        },
      },
      owner: true,
    },
    where,
    orderBy: {
      createdAt: 'desc',
    },
    take: limit + 1,
    cursor: getCursor(cursor),
  })

  let nextCursor: typeof cursor | undefined
  if (items.length > limit) {
    const nextItem = items.pop()
    nextCursor = nextItem!.id
  }

  return {
    items: transformMomentListResponse(items),
    nextCursor,
  }
}

/**
 * 使用页码分页查询动态列表
 */
export async function findMomentsByPage({
  userIds,
  page,
  pageSize,
  category,
  visibility = 'all',
}: {
  userIds: string[]
  page: number
  pageSize: number
  category?: string
  visibility?: 'all' | 'public' | 'private'
}) {
  const skip = (page - 1) * pageSize
  const where = buildMomentWhereClause({ userIds, category, visibility })

  // 获取总数
  const total = await db.moment.count({
    where,
  })

  // 获取分页数据
  const items = await db.moment.findMany({
    include: {
      images: {
        include: {
          image: {
            include: imageInclude,
          },
        },
        orderBy: {
          sort: 'asc',
        },
      },
      videos: {
        include: {
          video: {
            include: videoInclude,
          },
        },
        orderBy: {
          sort: 'asc',
        },
      },
      owner: true,
    },
    where,
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take: pageSize,
  })

  const totalPages = Math.ceil(total / pageSize)

  return {
    items: transformMomentListResponse(items),
    total,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

/**
 * 获取动态分类列表
 */
export async function getCategories(userIds: string[], visibility: 'all' | 'public' | 'private' = 'all') {
  const categories = await db.moment.findMany({
    select: {
      category: true,
    },
    where: buildMomentWhereClause({ userIds, visibility }),
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
  const whereClause: Prisma.MomentWhereInput = {
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
  const total = await db.moment.count({
    where: whereClause,
  })

  // 获取分页数据
  const items = await db.moment.findMany({
    skip,
    take: pageSize,
    where: whereClause,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      images: {
        include: {
          image: {
            include: imageInclude,
          },
        },
        orderBy: {
          sort: 'asc',
        },
      },
      videos: {
        include: {
          video: {
            include: videoInclude,
          },
        },
        orderBy: {
          sort: 'asc',
        },
      },
      owner: true,
    },
  })

  const totalPages = Math.ceil(total / pageSize)

  return {
    items: transformMomentListResponse(items),
    total,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}
