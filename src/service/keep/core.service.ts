import type { Prisma } from '@prisma/client'
/**
 * Keep 核心服务 - CRUD 操作
 */
import type { CreateKeepDTO, UpdateKeepDTO } from '@/dto/keep.dto'
import { HTTPException } from 'hono/http-exception'
import { after } from 'next/server'

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
 * 创建新的笔记
 */
export async function createKeep(input: CreateKeepDTO, ownerId: string) {
  const {
    content,
    isPublic = false,
    tags = [],
    category = 'default',
  } = input

  const keep = await db.keep.create({
    include: keepInclude,
    data: {
      content,
      isPublic,
      tags,
      category,
      ownerId,
    },
  })

  return keep
}

/**
 * 更新笔记内容
 */
export async function updateKeep(input: UpdateKeepDTO, id: string, ownerId: string) {
  const {
    title,
    content,
    summary,
    isPublic,
    tags,
    category,
  } = input

  const keep = await db.keep.update({
    include: keepInclude,
    where: {
      id,
      ownerId,
    },
    data: {
      title,
      content,
      summary,
      isPublic,
      tags,
      category,
    },
  })

  return keep
}

/**
 * 根据ID获取笔记
 */
export async function getKeepById(id: string, userIds: string[], updateViews: boolean) {
  const keep = await db.keep.findFirst({
    include: keepInclude,
    where: {
      id,
      OR: [
        {
          // Allow owner to see their own private keeps
          ownerId: {
            in: userIds,
          },
        },
        // Allow anyone to see public keeps
        { isPublic: true },
      ],
    },
  })

  if (!keep) {
    throw new HTTPException(404, { message: '笔记不存在或无权访问' })
  }

  // Only increment views if not the owner
  if (updateViews && !userIds.includes(keep.ownerId)) {
    // Update view count asynchronously (fire-and-forget) for better performance
    after(incrementKeepViews(id))
  }

  return keep
}

/**
 * 增加笔记浏览次数
 */
export async function incrementKeepViews(id: string) {
  return db.keep.update({
    where: { id },
    data: { views: { increment: 1 } },
  })
}

/**
 * 删除笔记
 */
export async function deleteKeep(id: string, ownerId: string) {
  return db.keep.delete({
    where: {
      id,
      ownerId,
    },
  })
}
