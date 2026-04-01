/**
 * Moment 数据转换器
 * 统一处理数据库返回数据到 API 响应格式的转换
 */
import type { Prisma } from '@prisma/client'
import { imageInclude, transformImageToResponse, transformVideoToResponse } from '@/service/asset.service'

/**
 * Moment 查询的 include 配置
 */
export const momentInclude = {
  images: {
    include: {
      image: {
        include: imageInclude,
      },
    },
    orderBy: {
      sort: 'asc' as const,
    },
  },
  videos: {
    include: {
      video: {
        include: {
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
          poster: {
            include: {
              bucket: true,
            },
          },
        },
      },
    },
    orderBy: {
      sort: 'asc' as const,
    },
  },
  owner: true,
} as const

/**
 * Moment 数据库查询结果类型（包含关联数据）
 */
export type MomentWithIncludes = Prisma.MomentGetPayload<{
  include: typeof momentInclude
}>

/**
 * 转换单个 Moment 为响应格式
 */
export function transformMomentResponse(moment: MomentWithIncludes) {
  return {
    ...moment,
    images: moment.images.map(({ image }) => transformImageToResponse(image)),
    videos: moment.videos.map(({ video }) => transformVideoToResponse(video)),
  }
}

/**
 * 转换后的 Moment 响应类型
 */
export type TransformedMoment = ReturnType<typeof transformMomentResponse>

/**
 * 转换 Moment 列表为响应格式
 */
export function transformMomentListResponse(moments: MomentWithIncludes[]) {
  return moments.map(transformMomentResponse)
}
