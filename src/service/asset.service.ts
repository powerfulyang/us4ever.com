import type { Prisma } from '@prisma/client'
import { Buffer } from 'node:buffer'
import { db } from '@/server/db'
import { TRPCError } from '@trpc/server'
import { getFileUrl } from './file.service'

// 定义包含关联数据的图片类型
export type ImageWithIncludes = Prisma.ImageGetPayload<{
  include: {
    original: {
      include: {
        bucket: true
      }
    }
    compressed: {
      include: {
        bucket: true
      }
    }
    thumbnail_320x: {
      include: {
        bucket: true
      }
    }
    thumbnail_768x: {
      include: {
        bucket: true
      }
    }
  }
}>

// 图片查询时的 include 配置
export const imageInclude = {
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

// 转换图片数据为 API 响应格式
export function transformImageToResponse(image: ImageWithIncludes) {
  const base64_1x1 = Buffer.from(image.thumbnail_10x).toString('base64')
  return {
    id: image.id,
    hash: image.hash,
    name: image.name,
    exif: image.exif,
    width: image.width,
    height: image.height,
    isPublic: image.isPublic,
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
    address: image.address,
  }
}

// 获取用户可访问的图片列表
export async function listAccessibleImages(userIds: string[]) {
  const images = await db.image.findMany({
    include: imageInclude,
    where: {
      OR: [
        {
          uploadedBy: {
            in: userIds,
          },
        },
        {
          isPublic: true,
        },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return images.map(transformImageToResponse)
}

//
export async function listAccessibleVideos(userIds: string[]) {
  const videos = await db.video.findMany({
    include: {
      file: {
        include: {
          bucket: true,
        },
      },
    },
    where: {
      OR: [
        {
          uploadedByUser: {
            id: {
              in: userIds,
            },
          },
        },
        {
          isPublic: true,
        },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return videos.map((video) => {
    return {
      ...video,
      url: getFileUrl(video.file),
    }
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
