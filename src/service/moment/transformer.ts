/**
 * Moment 数据转换器
 * 统一处理数据库返回数据到 API 响应格式的转换
 */
import { transformImageToResponse, transformVideoToResponse } from '@/service/asset.service'

/**
 * 转换单个 Moment 为响应格式
 */
export function transformMomentResponse(moment: any) {
  return {
    ...moment,
    images: moment.images?.map(({ image }: any) => transformImageToResponse(image)) ?? [],
    videos: moment.videos?.map(({ video }: any) => transformVideoToResponse(video)) ?? [],
  }
}

/**
 * 转换 Moment 列表为响应格式
 */
export function transformMomentListResponse(moments: any[]) {
  return moments.map(transformMomentResponse)
}
