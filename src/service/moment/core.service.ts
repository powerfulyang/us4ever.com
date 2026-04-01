import type { CreateMomentInput, UpdateMomentInput } from './types'
/**
 * Moment 核心服务 - CRUD 操作
 */
import { TRPCError } from '@trpc/server'
import { after } from 'next/server'
import { db } from '@/server/db'
import { imageInclude, videoInclude } from '@/service/asset.service'
import { transformMomentResponse } from './transformer'
import { updateMomentVectors } from './vector.service'

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
  const moment = await db.$transaction(async (tx) => {
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

  // 异步生成向量
  after(updateMomentVectors(moment.id, content ?? ''))

  return moment
}

/**
 * 更新动态内容
 * @returns 更新后的动态
 */
export async function updateMoment(input: UpdateMomentInput, ownerId: string) {
  const { id, content, category, images = [], videos = [] } = input

  // 使用事务确保原子性操作
  const moment = await db.$transaction(async (tx) => {
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

  // 异步生成向量
  after(updateMomentVectors(id, content ?? ''))

  return moment
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

  return transformMomentResponse(moment)
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
    images: { id: string, sort: number, name?: string }[]
    videos: { id: string, sort: number, name?: string }[]
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

  // 过滤出已存在的图片和视频名称，避免重复创建
  const existingImageNames = new Set(moment.images.map(item => item.image.name).filter(Boolean))
  const existingVideoNames = new Set(moment.videos.map(item => item.video.name).filter(Boolean))

  // 过滤出需要新创建的附件
  const newImages = images.filter(image => image.name && !existingImageNames.has(image.name))
  const newVideos = videos.filter(video => video.name && !existingVideoNames.has(video.name))

  // 使用事务确保原子性操作
  return db.$transaction(async (tx) => {
    // 批量添加图片附件
    if (newImages.length > 0) {
      await tx.momentImages.createMany({
        data: newImages.map(image => ({
          momentId,
          imageId: image.id,
          sort: image.sort,
        })),
        skipDuplicates: true,
      })
    }

    // 批量添加视频附件
    if (newVideos.length > 0) {
      await tx.momentVideos.createMany({
        data: newVideos.map(video => ({
          momentId,
          videoId: video.id,
          sort: video.sort,
        })),
        skipDuplicates: true,
      })
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
