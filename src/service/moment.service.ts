import type { Prisma } from '@prisma/client'
import type { BaseListFilter } from '@/types/common'
import { TRPCError } from '@trpc/server'
import { map } from 'lodash-es'
import { after } from 'next/server'
import { imageInclude, transformImageToResponse, transformVideoToResponse, videoInclude } from 'src/service/asset.service'
import { SEARCH_ENDPOINT } from '@/lib/constants'
import { db } from '@/server/db'
import { getCursor } from '@/service'

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
export interface MomentVideo extends MomentImage { }

/**
 * 创建动态的输入参数接口
 */
interface CreateMomentInput extends Omit<Prisma.MomentCreateManyInput, 'ownerId'> {
  images?: MomentImage[]
  videos?: MomentVideo[]
}

/**
 * 更新动态的输入参数接口
 */
interface UpdateMomentInput extends CreateMomentInput {
  id: string
}

/**
 * 查询动态列表的输入参数接口
 */
interface ListMomentInput extends BaseListFilter {
  category?: string
  take?: number
  cursor?: string
}

/**
 * 查询动态列表的输入参数接口(带游标)
 */
interface FindMomentsByCursorInput {
  userIds: string[]
  limit: number
  cursor?: string
  category?: string
}

/**
 * 分页查询动态列表
 * @param params 查询参数
 * @param params.userIds 用户ID列表
 * @param params.category 动态分类
 * @param params.take 每页数量
 * @param params.cursor 游标ID
 * @returns 动态列表
 */
export async function listMoments({ userIds, category, take, cursor }: ListMomentInput) {
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

  return list.map(moment => ({
    ...moment,
    images: moment.images.map(({ image }) => transformImageToResponse(image)),
    videos: moment.videos.map(({ video }) => transformVideoToResponse(video)),
  }))
}

/**
 * 使用游标分页查询动态列表
 * @param params 查询参数
 * @param params.userIds 用户ID列表
 * @param params.limit 每页数量
 * @param params.cursor 游标ID
 * @param params.category 动态分类
 * @returns 动态列表和下一页游标
 */
export async function findMomentsByCursor({ userIds, limit, cursor, category }: FindMomentsByCursorInput) {
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
    where: {
      category,
      OR: [
        {
          ownerId: {
            in: userIds,
          },
        },
        { isPublic: true },
      ],
    },
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
    items: items.map(moment => ({
      ...moment,
      images: moment.images.map(({ image }) => transformImageToResponse(image)),
      videos: moment.videos.map(({ video }) => transformVideoToResponse(video)),
    })),
    nextCursor,
  }
}

/**
 * 创建新的动态
 * @returns 创建的动态
 */
export async function createMoment(input: CreateMomentInput, ownerId: string) {
  const {
    category = 'default',
    images = [],
    videos = [],
    isPublic = false,
    content,
    tags = [],
    extraData = {},
  } = input

  // 使用事务确保原子性操作
  return await db.$transaction(async (tx) => {
    return tx.moment.create({
      data: {
        category,
        isPublic,
        ownerId,
        content,
        tags,
        extraData,
        images: {
          create: images.map((image) => {
            return {
              image: {
                connect: {
                  id: image.id,
                },
              },
              sort: image.sort,
            }
          }),
        },
        videos: {
          create: videos.map((video) => {
            return {
              video: {
                connect: {
                  id: video.id,
                },
              },
              sort: video.sort,
            }
          }),
        },
      },
    })
  })
}

/**
 * 更新动态内容
 * @returns 更新后的动态
 */
export async function updateMoment(input: UpdateMomentInput, ownerId: string) {
  const { id, content, category, images = [], videos = [] } = input

  // 使用事务确保原子性操作
  return db.$transaction(async (tx) => {
    // 删除旧的图片关联
    await tx.momentImages.deleteMany({
      where: {
        momentId: id,
      },
    })

    // 删除旧的视频关联
    await tx.momentVideos.deleteMany({
      where: {
        momentId: id,
      },
    })

    // 更新动态和创建新的图片关联
    return tx.moment.update({
      where: {
        id,
        ownerId,
      },
      data: {
        content,
        category,
        images: {
          create: images.map((image) => {
            return {
              image: {
                connect: {
                  id: image.id,
                },
              },
              sort: image.sort,
            }
          }),
        },
        videos: {
          create: videos.map((video) => {
            return {
              video: {
                connect: {
                  id: video.id,
                },
              },
              sort: video.sort,
            }
          }),
        },
      },
      include: {
        images: {
          include: {
            image: true,
          },
        },
      },
    })
  })
}

/**
 * 删除动态
 * @param id 动态ID
 * @param ownerId 所有者ID
 * @returns 删除的动态
 */
export async function deleteMoment(id: string, ownerId: string) {
  // 使用事务确保原子性操作
  return db.$transaction(async (tx) => {
    // 删除关联的图片关系
    await tx.momentImages.deleteMany({
      where: {
        momentId: id,
      },
    })

    // 删除关联的视频关系
    await tx.momentVideos.deleteMany({
      where: {
        momentId: id,
      },
    })

    // 删除动态
    return tx.moment.delete({
      where: {
        id,
        ownerId,
      },
    })
  })
}

/**
 * 根据内容和创建时间查找动态
 * @param content 动态内容
 * @param createdAt 创建时间
 * @returns 找到的动态
 */
export async function findMoment(content: string, createdAt: Date) {
  return db.moment.findFirst({
    where: {
      content,
      createdAt,
    },
  })
}

/**
 * 为动态添加图片或视频附件
 * @param momentId 动态ID
 * @param attachments 附件信息
 * @param attachments.images 图片列表
 * @param attachments.videos 视频列表
 */
export async function addMomentAttachment(
  momentId: string,
  attachments: {
    images: MomentImage[]
    videos: MomentVideo[]
  },
) {
  const moment = await db.moment.findUnique({
    where: {
      id: momentId,
    },
    include: {
      images: {
        include: {
          image: true,
        },
      },
      videos: {
        include: {
          video: true,
        },
      },
    },
  })

  if (!moment) {
    throw new Error('moment not found')
  }

  const { images = [], videos = [] } = attachments

  // 使用事务确保原子性操作
  return db.$transaction(async (tx) => {
    // 添加图片附件
    for (const image of images) {
      const exist = moment.images.some(item => item.image.name === image.name)
      if (exist) {
        continue
      }
      const result = await tx.momentImages.create({
        data: {
          momentId,
          imageId: image.id,
          sort: image.sort,
        },
      })
      console.log(`addMomentAttachment[images]: ${momentId}`, result.imageId)
    }

    // 添加视频附件
    for (const video of videos) {
      const exist = moment.videos.some(item => item.video.name === video.name)
      if (exist) {
        continue
      }
      const result = await tx.momentVideos.create({
        data: {
          momentId,
          videoId: video.id,
          sort: video.sort,
        },
      })
      console.log(`addMomentAttachment[videos]: ${momentId}`, result.videoId)
    }

    // 返回更新后的动态
    return tx.moment.findUnique({
      where: { id: momentId },
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
      },
    })
  })
}

/**
 * 根据ID获取动态详情
 * @param id 动态ID
 * @param userIds 用户ID列表
 * @returns 动态详情
 */
export async function getMomentById(id: string, userIds: string[]) {
  const moment = await db.moment.findUnique({
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
      id,
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
  })

  if (!moment) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: '动态不存在或无权访问',
    })
  }

  // Only increment views if not the owner
  if (moment && !userIds.includes(moment.ownerId)) {
    // Update view count asynchronously (fire-and-forget) for better performance
    after(incrementMomentViews(id))
  }

  return {
    ...moment,
    images: moment.images.map(({ image }) => transformImageToResponse(image)),
    videos: moment.videos.map(({ video }) => transformVideoToResponse(video)),
  }
}

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
}

export interface Highlight {
  content?: string[]
}

export interface Total {
  value: number
  relation: string
}

/**
 * 搜索动态
 * @param searchTerm 搜索关键词
 * @returns 搜索结果
 */
export async function searchMoments(searchTerm: string): Promise<SearchResult> {
  const response = await fetch(`${SEARCH_ENDPOINT}/moments?q=${encodeURIComponent(searchTerm)}`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return await response.json()
}

/**
 * 搜索动态并返回结果
 * @param query 搜索关键词
 * @param userIds 用户ID列表
 * @returns 搜索结果列表
 */
export async function searchAndFetchMoments(query: string, userIds: string[]) {
  if (!query.trim()) {
    return []
  }

  const result = await searchMoments(query)
  const resultList = result.hits.hits
  const ids = map(resultList, '_id')

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

  // 转换为Map以便按原始搜索结果的顺序排序
  const momentsMap = new Map(
    list.map(
      moment => [
        moment.id,
        {
          ...moment,
          content: resultList.find(hit => hit._id === moment.id)?.highlight?.content?.[0] || moment.content,
          images: moment.images.map(({ image }) => transformImageToResponse(image)),
          videos: moment.videos.map(({ video }) => transformVideoToResponse(video)),
        },
      ],
    ),
  )

  // 按照原始搜索结果的顺序返回
  return ids.filter(id => momentsMap.has(id)).map(id => momentsMap.get(id)!)
}

/**
 * 获取公开的动态列表
 * @returns 公开的动态列表
 */
export async function fetchPublicItems() {
  return db.moment.findMany({
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
 * 更新动态的浏览次数
 * @param id 动态ID
 * @returns 更新结果
 */
export async function incrementMomentViews(id: string) {
  return db.moment.update({
    where: { id },
    data: { views: { increment: 1 } },
  })
}

/**
 * 获取动态分类列表
 * @param userIds 用户ID列表
 * @returns 分类列表
 */
export async function getCategories(userIds: string[]) {
  const categories = await db.moment.findMany({
    select: {
      category: true,
    },
    where: {
      OR: [
        { ownerId: { in: userIds } },
        { isPublic: true },
      ],
    },
    distinct: ['category'],
  })
  return categories.map(category => category.category)
}

export const momentService = {
  listMoments,
  findMomentsByCursor,
  createMoment,
  updateMoment,
  deleteMoment,
  findMoment,
  addMomentAttachment,
  getMomentById,
  searchMoments,
  searchAndFetchMoments,
  fetchPublicItems,
  incrementMomentViews,
  getCategories,
}
