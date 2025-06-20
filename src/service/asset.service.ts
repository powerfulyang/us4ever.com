import type { Prisma } from '@prisma/client'
import type { BaseListFilter } from '@/types/common'
import { Buffer } from 'node:buffer'
import { TRPCError } from '@trpc/server'
import { sha256 } from 'hono/utils/crypto'
import { pick } from 'lodash-es'
import sharp from 'sharp'
import { db } from '@/server/db'
import { imageminService } from '@/service/imagemin.service'
import { getCursor } from '@/service/index'
import { delete_from_bucket, upload_to_bucket } from '@/service/s3.service'
import { getFileSize, getFileUrl, handleImagePostProcess } from './file.service'

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
 * 转换图片资源为响应格式
 * @param image 图片资源
 * @returns 转换后的图片资源
 */
export function transformImageToResponse(image: ImageWithIncludes) {
  const base64_1x1 = Buffer.from(image.thumbnail_10x).toString('base64')
  return {
    ...image,
    moments: image.moments?.map(({ moment }) => moment) ?? [],
    original_url: getFileUrl(image.original),
    original_size: getFileSize(image.original),
    compressed_url: getFileUrl(image.compressed),
    compressed_size: getFileSize(image.compressed),
    thumbnail_320x_url: getFileUrl(image.thumbnail_320x),
    thumbnail_320x_size: getFileSize(image.thumbnail_320x),
    thumbnail_768x_url: getFileUrl(image.thumbnail_768x),
    thumbnail_768x_size: getFileSize(image.thumbnail_768x),
    thumbnail_10x_url: `data:image/avif;base64,${base64_1x1}`,
    thumbnail_10x_size: image.thumbnail_10x.byteLength,
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
 * 视频资源类型
 */
export function transformVideoToResponse(video: VideoWithIncludes) {
  return {
    ...video,
    file_url: getFileUrl(video.file),
  }
}

/**
 * 查询视频列表的输入参数接口
 */
interface ListVideoInput extends BaseListFilter {
  take?: number
  cursor?: string
}

/**
 * 分页查询图片列表
 * @returns 图片列表
 */
async function listImages({ userIds, take, cursor, category }: ListImageInput) {
  const list = await db.image.findMany({
    include: imageInclude,
    where: {
      category,
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
    cursor: getCursor(cursor),
  })

  return list.map(transformImageToResponse)
}

/**
 * 分页查询视频列表
 * @returns 视频列表
 */
async function listVideos({ userIds, take, cursor, category }: ListVideoInput) {
  const list = await db.video.findMany({
    include: videoInclude,
    where: {
      category,
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
    cursor: getCursor(cursor),
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
async function createImage(input: CreateImageInput) {
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
async function createVideo(input: CreateVideoInput) {
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
async function updateImage(input: UpdateImageInput) {
  const { id, uploadedById, ...rest } = input
  return db.image.update({
    where: {
      id,
      uploadedBy: uploadedById,
    },
    data: rest,
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
async function updateVideo(input: UpdateVideoInput) {
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
async function deleteImage(id: string, uploadedById: string) {
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
async function deleteVideo(id: string, uploadedById: string) {
  return db.video.delete({
    where: {
      id,
      uploadedBy: uploadedById,
    },
  })
}

/**
 * 根据ID获取图片资源
 * @param id 图片ID
 * @param userIds 用户ID列表
 * @returns 图片资源
 */
async function getImageById(id: string, userIds: string[]) {
  const image = await db.image.findFirst({
    include: imageInclude,
    where: {
      id,
      OR: [
        {
          uploadedBy: {
            in: userIds,
          },
        },
        { isPublic: true },
      ],
    },
  })

  if (!image) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: '图片不存在或无权访问',
    })
  }

  return transformImageToResponse(image)
}

/**
 * 上传图片
 * @returns 上传结果
 */
async function uploadImage(
  options: {
    file: File
    uploadedBy: string
    isPublic?: boolean
    category: string
  },
) {
  const { file, isPublic = false, uploadedBy, category } = options
  const buffer = await file.arrayBuffer()
  const name = file.name
  const type = file.type
  let width = 0
  let height = 0
  try {
    const metadata = await sharp(buffer).metadata()
    width = metadata.width || 0
    height = metadata.height || 0
  }
  catch (e) {
    console.error('sharp metadata error', e)
  }

  let thumbnail_320x_image: any = null

  try {
    const thumbnail_mime_type = 'image/avif'

    // 生成 10x 的模糊预览图
    const thumbnail_10x_buffer = await imageminService(buffer, {
      width: 10,
    })

    // 生成 320x 的缩略图
    const thumbnail_320x_buffer = await imageminService(buffer, {
      width: 320,
    })
    thumbnail_320x_image = await upload_to_bucket({
      buffer: thumbnail_320x_buffer,
      name,
      type: thumbnail_mime_type,
      uploadedBy,
      bucketName: 'thumbnails',
      path_prefix: `images/${category}/320x`,
      isPublic,
      category,
    })

    const hash = (await sha256(buffer))!
    const size = file.size

    // 创建图片记录（部分字段为 null，异步后补）
    const image = await db.image.create({
      data: {
        name,
        type,
        size,
        width,
        height,
        hash,
        address: '', // 后补
        exif: {}, // 后补
        thumbnail_10x: Buffer.from(thumbnail_10x_buffer), // 后补
        thumbnail_320x: {
          connect: pick(thumbnail_320x_image, 'id'),
        },
        uploadedByUser: {
          connect: { id: uploadedBy },
        },
        isPublic,
        category,
      },
      include: imageInclude,
    })

    process.nextTick(() => {
      // 异步处理其余图片任务
      void handleImagePostProcess({
        buffer,
        name,
        type,
        uploadedBy,
        isPublic,
        category,
        imageId: image.id,
      })
    })

    // 只返回主记录和 320x 缩略图
    // oss 跨地区复制需要时间，所以需要返回 base64 的 320x 缩略图
    const result = transformImageToResponse(image)
    const base64_320x = Buffer.from(thumbnail_320x_buffer).toString('base64')
    result.thumbnail_320x_url = `data:image/avif;base64,${base64_320x}`
    return result
  }
  catch (e) {
    console.error(e)
    // 失败回滚，删除已上传的文件
    const images = [thumbnail_320x_image]
    for (const image of images) {
      if (image) {
        await delete_from_bucket(image)
      }
    }
    throw e
  }
}

async function getImageCategories() {
  const categories = await db.image.findMany({
    select: {
      category: true,
    },
    distinct: ['category'],
  })
  return categories.map(({ category }) => category)
}

export const assetService = {
  findImagesByCursor: listImages,
  findVideosByCursor: listVideos,
  createImage,
  createVideo,
  updateImage,
  updateVideo,
  deleteImage,
  deleteVideo,
  getImageById,
  transformImageToResponse,
  transformVideoToResponse,
  uploadImage,
  getImageCategories,
}
