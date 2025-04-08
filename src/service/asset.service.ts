import type { BaseListFilter } from '@/types/common'
import type { Prisma } from '@prisma/client'
import { Buffer } from 'node:buffer'
import { db } from '@/server/db'
import { TRPCError } from '@trpc/server'
import { getFileUrl } from './file.service'

/**
 * 图片资源包含的关联数据
 */
export const imageInclude = {
  uploadedByUser: true,
  moments: {
    include: {
      moment: true,
    },
  },
  original: {
    include: {
      bucket: true,
    },
  },
  compressed: {
    include: {
      bucket: true,
    },
  },
  thumbnail_320x: {
    include: {
      bucket: true,
    },
  },
  thumbnail_768x: {
    include: {
      bucket: true,
    },
  },
} as const

/**
 * 视频资源包含的关联数据
 */
export const videoInclude = {
  uploadedByUser: true,
  moments: {
    include: {
      moment: true,
    },
  },
  file: {
    include: {
      bucket: true,
    },
  },
} as const

/**
 * 图片资源类型
 */
export type ImageWithIncludes = Prisma.ImageGetPayload<{
  include: typeof imageInclude
}>

/**
 * 视频资源类型
 */
export type VideoWithIncludes = Prisma.VideoGetPayload<{
  include: typeof videoInclude
}>

/**
 * 将图片资源转换为响应格式
 * @param image 图片资源
 * @returns 转换后的图片资源
 */
export function transformImageToResponse(image: ImageWithIncludes) {
  const base64_1x1 = Buffer.from(image.thumbnail_10x).toString('base64')
  return {
    ...image,
    moments: image.moments?.map(({ moment }) => moment) ?? [],
    original_url: getFileUrl(image.original),
    original_size: image.original.size,
    compressed_url: getFileUrl(image.compressed),
    compressed_size: image.compressed.size,
    thumbnail_320x_url: getFileUrl(image.thumbnail_320x),
    thumbnail_320x_size: image.thumbnail_320x.size,
    thumbnail_768x_url: getFileUrl(image.thumbnail_768x),
    thumbnail_768x_size: image.thumbnail_768x.size,
    thumbnail_10x_url: `data:image/avif;base64,${base64_1x1}`,
    thumbnail_10x_size: image.thumbnail_10x.byteLength,
  }
}

/**
 * 将视频资源转换为响应格式
 * @param video 视频资源
 * @returns 转换后的视频资源
 */
export function transformVideoToResponse(video: VideoWithIncludes) {
  return {
    ...video,
    file_url: getFileUrl(video.file),
  }
}

/**
 * 查询图片列表的输入参数接口
 */
interface ListImageInput extends BaseListFilter {
  take?: number
  cursor?: string
}

/**
 * 分页查询图片列表
 * @param params 查询参数
 * @param params.userIds 用户ID列表
 * @param params.take 每页数量
 * @param params.cursor 游标ID
 * @returns 图片列表
 */
export async function listImages({ userIds, take, cursor }: ListImageInput) {
  const list = await db.image.findMany({
    include: imageInclude,
    where: {
      OR: [
        {
          uploadedBy: {
            in: userIds,
          },
        },
        { isPublic: true },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
    take,
    cursor: cursor ? { id: cursor } : undefined,
  })

  return list.map(transformImageToResponse)
}

/**
 * 查询视频列表的输入参数接口
 */
interface ListVideoInput extends BaseListFilter {
  take?: number
  cursor?: string
}

/**
 * 分页查询视频列表
 * @param params 查询参数
 * @param params.userIds 用户ID列表
 * @param params.take 每页数量
 * @param params.cursor 游标ID
 * @returns 视频列表
 */
export async function listVideos({ userIds, take, cursor }: ListVideoInput) {
  const list = await db.video.findMany({
    include: videoInclude,
    where: {
      OR: [
        {
          uploadedBy: {
            in: userIds,
          },
        },
        { isPublic: true },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
    take,
    cursor: cursor ? { id: cursor } : undefined,
  })

  return list.map(transformVideoToResponse)
}

/**
 * 创建图片资源的输入参数接口
 */
interface CreateImageInput extends Omit<Prisma.ImageCreateInput, 'uploadedByUser' | 'thumbnail_10x'> {
  uploadedById: string
  thumbnail_10x: Buffer
}

/**
 * 创建新的图片资源
 * @param input 创建图片的参数
 * @returns 创建的图片资源
 */
export async function createImage(input: CreateImageInput) {
  const { isPublic = false, uploadedById, thumbnail_10x, ...rest } = input
  return db.image.create({
    data: {
      isPublic,
      thumbnail_10x,
      ...rest,
      uploadedByUser: {
        connect: {
          id: uploadedById,
        },
      },
    },
  })
}

/**
 * 创建视频资源的输入参数接口
 */
interface CreateVideoInput extends Omit<Prisma.VideoCreateInput, 'uploadedByUser'> {
  uploadedById: string
}

/**
 * 创建新的视频资源
 * @param input 创建视频的参数
 * @returns 创建的视频资源
 */
export async function createVideo(input: CreateVideoInput) {
  const { isPublic = false, uploadedById, ...rest } = input
  return db.video.create({
    data: {
      isPublic,
      ...rest,
      uploadedByUser: {
        connect: {
          id: uploadedById,
        },
      },
    },
  })
}

/**
 * 更新图片资源的输入参数接口
 */
interface UpdateImageInput extends Omit<Prisma.ImageUpdateInput, 'uploadedByUser' | 'thumbnail_10x'> {
  id: string
  uploadedById: string
  thumbnail_10x?: Buffer
}

/**
 * 更新图片资源
 * @param input 更新图片的参数
 * @returns 更新后的图片资源
 */
export async function updateImage(input: UpdateImageInput) {
  const { id, uploadedById, thumbnail_10x, ...rest } = input
  return db.image.update({
    where: {
      id,
      uploadedBy: uploadedById,
    },
    data: {
      ...rest,
      ...(thumbnail_10x ? { thumbnail_10x } : {}),
    },
  })
}

/**
 * 更新视频资源的输入参数接口
 */
interface UpdateVideoInput extends Omit<Prisma.VideoUpdateInput, 'uploadedByUser'> {
  id: string
  uploadedById: string
}

/**
 * 更新视频资源
 * @param input 更新视频的参数
 * @returns 更新后的视频资源
 */
export async function updateVideo(input: UpdateVideoInput) {
  const { id, uploadedById, ...rest } = input
  return db.video.update({
    where: {
      id,
      uploadedBy: uploadedById,
    },
    data: rest,
  })
}

/**
 * 删除图片资源
 * @param id 图片ID
 * @param uploadedById 上传者ID
 * @returns 删除的图片资源
 */
export async function deleteImage(id: string, uploadedById: string) {
  return db.image.delete({
    where: {
      id,
      uploadedBy: uploadedById,
    },
  })
}

/**
 * 删除视频资源
 * @param id 视频ID
 * @param uploadedById 上传者ID
 * @returns 删除的视频资源
 */
export async function deleteVideo(id: string, uploadedById: string) {
  return db.video.delete({
    where: {
      id,
      uploadedBy: uploadedById,
    },
  })
}

// 获取单张图片
export async function getImageById(id: string, userId?: string) {
  const image = await db.image.findUnique({
    where: {
      id,
    },
    include: imageInclude,
  })

  if (!image) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: '图片不存在',
    })
  }

  // 检查权限
  if (!image.isPublic && image.uploadedBy !== userId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '无权访问该图片',
    })
  }

  return transformImageToResponse(image)
}
