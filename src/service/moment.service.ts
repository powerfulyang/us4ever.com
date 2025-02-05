import type { BaseListFilter } from '@/types/common'
import { db } from '@/server/db'
import { imageInclude, transformImageToResponse } from './image.service'

interface CreateMomentInput {
  content: string
  category?: string
  imageIds?: string[]
  ownerId: string
  isPublic?: boolean
  createdAt?: Date
}

interface UpdateMomentInput extends CreateMomentInput {
  id: string
}

export async function listMoments({ userIds }: BaseListFilter) {
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
    },
    where: {
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
  })

  return list.map(moment => ({
    ...moment,
    images: moment.images.map(({ image }) => transformImageToResponse(image)),
  }))
}

export async function createMoment(input: CreateMomentInput) {
  const { content, category = 'default', imageIds = [], ownerId, isPublic = false, createdAt } = input
  return db.moment.create({
    data: {
      content,
      category,
      ownerId,
      isPublic,
      createdAt,
      images: {
        create: imageIds.map((imageId, index) => ({
          imageId,
          sort: index,
        })),
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

export async function updateMoment(input: UpdateMomentInput) {
  const { id, content, category, imageIds = [], ownerId } = input

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
        create: imageIds.map((imageId, index) => ({
          imageId,
          sort: index,
        })),
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
