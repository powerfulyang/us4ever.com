import type { Prisma } from '@prisma/client'
import type { CreateKeepDTO, QueryKeepDTO, UpdateKeepDTO } from '@/dto/keep.dto'
import { HTTPException } from 'hono/http-exception'
import { map } from 'lodash-es'
import { after } from 'next/server'
import { SEARCH_ENDPOINT } from '@/lib/constants'
import { db } from '@/server/db'
import { getCursor } from '@/service/index'

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
 * @param input 创建笔记的参数
 * @param ownerId
 * @returns 创建的笔记
 */
export async function createKeep(input: CreateKeepDTO, ownerId: string) {
  const {
    content,
    isPublic = false,
    tags = [],
    category = 'default',
  } = input

  return db.keep.create({
    include: keepInclude,
    data: {
      content,
      isPublic,
      tags,
      category,
      ownerId,
    },
  })
}

/**
 * 更新笔记内容
 * @param input 更新笔记的参数
 * @param id
 * @param ownerId
 * @returns 更新后的笔记
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

  return db.keep.update({
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
}

/**
 * 根据ID获取笔记
 * @param id 笔记ID
 * @param userIds 用户ID列表
 * @param updateViews
 * @returns 笔记详情
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
 * @param id 笔记ID
 * @returns 更新后的笔记
 */
export async function incrementKeepViews(id: string) {
  return db.keep.update({
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
    where: {
      id,
      ownerId,
    },
  })
}

async function findPublicList() {
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

// 查找用户可访问的列表
async function findAccessibleList(query: QueryKeepDTO, userIds: string[]) {
  const { limit = 10, cursor, category } = query

  const items = await db.keep.findMany({
    take: limit + 1,
    where: {
      category,
      OR: [
        {
          ownerId: {
            in: userIds,
          },
        },
        {
          isPublic: true,
        },
      ],
    },
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

// 搜索结果接口定义
export interface SearchResult {
  hits: Hits
}

export interface Hits {
  total: Total
  hits: Hit[]
}

export interface Hit {
  _index: string
  _id: string
  _score: number
  _source: Source
  highlight?: Highlight
}

export interface Source {
  content: string
  summary: string
  title: string
}

export interface Highlight {
  summary?: string[]
  title?: string[]
  content?: string[]
}

export interface Total {
  value: number
  relation: string
}

/**
 * 调用外部搜索服务搜索笔记
 * @param searchTerm 搜索关键词
 * @returns 搜索结果
 */
async function searchKeeps(searchTerm: string): Promise<SearchResult> {
  const response = await fetch(`${SEARCH_ENDPOINT}/keeps?q=${encodeURIComponent(searchTerm)}`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return await response.json()
}

/**
 * 搜索笔记并过滤出用户有权访问的内容
 * @param query 搜索关键词
 * @param userIds 用户ID列表
 * @returns 过滤后的搜索结果
 */
async function searchKeepsWithAccess(query: string, userIds: string[]) {
  const result = await searchKeeps(query)
  const resultList = result.hits.hits
  const ids = map(resultList, '_id')

  const list = await db.keep.findMany({
    select: {
      id: true,
    },
    where: {
      id: {
        in: ids,
      },
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

  // 按照原始搜索结果的顺序返回
  return resultList.filter(hit => list.some(keep => keep.id === hit._id))
}

export const keepService = {
  findAccessibleList,
  findPublicList,
  createKeep,
  updateKeep,
  getKeepById,
  deleteKeep,
  incrementKeepViews,
  searchKeepsWithAccess,
}
