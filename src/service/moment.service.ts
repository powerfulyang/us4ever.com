import type { BaseListFilter } from '@/types/common'
import type { Prisma } from '@prisma/client'
import * as process from 'node:process'
import { db } from '@/server/db'
import { createKeep } from '@/service/keep.service'
import { imageInclude, transformImageToResponse } from 'src/service/asset.service'

interface CreateMomentInput extends Prisma.MomentCreateManyInput {
  images?: { id: string, sort: number }[]
  videos?: { id: string, sort: number }[]
  ownerId: string
}

interface UpdateMomentInput extends CreateMomentInput {
  id: string
}

interface ListMomentInput extends BaseListFilter {
  category?: string
}

export async function listMoments({ userIds, category }: ListMomentInput) {
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
  })

  return list.map(moment => ({
    ...moment,
    images: moment.images.map(({ image }) => transformImageToResponse(image)),
  }))
}

export async function createMoment(input: CreateMomentInput) {
  const { content, category = 'default', images = [], videos = [], ownerId, isPublic = false, createdAt } = input
  const result = await db.moment.create({
    data: {
      content,
      category,
      ownerId,
      isPublic,
      createdAt,
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

export async function findMoment(content: string, createdAt: Date) {
  return db.moment.findFirst({
    where: {
      content,
      createdAt,
    },
  })
}
