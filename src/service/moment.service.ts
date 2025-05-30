import type { Prisma } from '@prisma/client'
import type { BaseListFilter } from '@/types/common'
import * as process from 'node:process'
import { TRPCError } from '@trpc/server'
import { imageInclude, transformImageToResponse, transformVideoToResponse, videoInclude } from 'src/service/asset.service'
import { enhancement } from '@/lib/deepseek'
import { db } from '@/server/db'
import { createKeep } from '@/service/keep.service'

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
interface CreateMomentInput extends Prisma.MomentCreateManyInput {
  images?: MomentImage[]
  videos?: MomentVideo[]
  ownerId: string
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
    cursor: cursor ? { id: cursor } : undefined,
  })

  return list.map(moment => ({
    ...moment,
    images: moment.images.map(({ image }) => transformImageToResponse(image)),
    videos: moment.videos.map(({ video }) => transformVideoToResponse(video)),
  }))
}

/**
 * 创建新的动态
 * @param input 创建动态的参数
 * @returns 创建的动态
 */
export async function createMoment(input: CreateMomentInput) {
  const {
    category = 'default',
    images = [],
    videos = [],
    isPublic = false,
    ...rest
  } = input
  const { content, ownerId } = rest
  const result = await db.moment.create({
    data: {
      category,
      isPublic,
      ...rest,
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

  // 如果是关键词转博客类型，异步生成博客内容
  if (result.category === 'keyword2blog' && content) {
    process.nextTick(async () => {
      const blog = await enhancement(content)
      const keep = await createKeep({
        content: blog,
        isPublic,
        ownerId,
        category: 'keyword2blog',
      })
      await db.moment.update({
        where: {
          id: result.id,
        },
        data: {
          content: `[生成结果](/keep/${keep.id})\n\n${content}`,
        },
      })
    })
  }

  return result
}

/**
 * 更新动态内容
 * @param input 更新动态的参数
 * @returns 更新后的动态
 */
export async function updateMoment(input: UpdateMomentInput) {
  const { id, content, category, images = [], ownerId } = input

  // 删除旧的图片关联
  await db.momentImages.deleteMany({
    where: {
      momentId: id,
    },
  })

  // 更新动态和创建新的图片关联
  return db.moment.update({
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
    },
    include: {
      images: {
        include: {
          image: true,
        },
      },
    },
  })
}

/**
 * 删除动态
 * @param id 动态ID
 * @param ownerId 所有者ID
 * @returns 删除的动态
 */
export async function deleteMoment(id: string, ownerId: string) {
  // 删除关联的图片关系
  await db.momentImages.deleteMany({
    where: {
      momentId: id,
    },
  })

  // 删除动态
  return db.moment.delete({
    where: {
      id,
      ownerId,
    },
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

  // 添加图片附件
  for (const image of images) {
    const exist = moment.images.some(item => item.image.name === image.name)
    if (exist) {
      continue
    }
    const result = await db.momentImages.create({
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
    const result = await db.momentVideos.create({
      data: {
        momentId,
        videoId: video.id,
        sort: video.sort,
      },
    })
    console.log(`addMomentAttachment[videos]: ${momentId}`, result.videoId)
  }
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

  return {
    ...moment,
    images: moment.images.map(({ image }) => transformImageToResponse(image)),
    videos: moment.videos.map(({ video }) => transformVideoToResponse(video)),
  }
}
