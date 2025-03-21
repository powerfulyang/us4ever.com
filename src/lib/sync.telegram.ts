import type { TelegramSyncItem } from '@/server/hono/routes/telegram'
import type { MomentImage, MomentVideo } from '@/service/moment.service'
import * as path from 'node:path'
import { env } from '@/env'
import { db } from '@/server/db'
import { upload_image, upload_video } from '@/service/file.service'
import { addMomentAttachment } from '@/service/moment.service'

export interface TelegramMessage {
  id: number
  message: string
  filePath: string
  groupedId: string
  createdAt: number
  updatedAt: number
}

export async function syncTelegram(offsetId = 0, limit = 100) {
  const params = new URLSearchParams({
    offsetId: offsetId.toString(),
    limit: limit.toString(),
    download_media: 'true',
  })
  const response = await fetch(
    `${env.TELEGRAM_API_ENDPOINT}/history?${params.toString()}`,
  )
  if (response.ok) {
    const messages: TelegramMessage[] = await response.json()
    return messages
  }
  return []
}

export async function handleFile({ value: item }: TelegramSyncItem) {
  const category = 'telegram:emt_channel'
  // 根据 groupedId 查询
  const groupedId = item.groupedId
  const filePath = item.filePath

  // 上传文件
  const imageList: MomentImage[] = []
  const videoList: MomentVideo[] = []

  if (!filePath) {
    return {
      imageList,
      videoList,
      needCreateMoment: true,
    }
  }

  // download file
  const url = new URL(`${env.TELEGRAM_API_ENDPOINT}/${filePath}`)
  const blob = await fetch(url.toString()).then(res => res.blob())
  const filename = path.basename(url.pathname)
  const file = new File([blob], filename, { type: blob.type })

  const fileType = file.type
  if (fileType.startsWith('image/')) {
    // 上传图片
    const image = await upload_image({
      file,
      uploadedBy: item.ownerId,
      category,
    })
    imageList.push({
      id: image.id,
      sort: 0,
      name: filename,
    })
  }
  else if (fileType.startsWith('video/')) {
    // 上传视频
    const video = await upload_video({
      file,
      uploadedBy: item.ownerId,
      category,
    })
    videoList.push({
      id: video.id,
      sort: 0,
      name: filename,
    })
  }
  // 如果已存在则 addAttachment
  if (groupedId) {
    const exist = await db.moment.findFirst({
      where: {
        category,
        extraData: {
          path: ['groupedId'],
          equals: groupedId,
        },
      },
    })
    if (exist) {
      // addAttachment
      await addMomentAttachment(exist.id, {
        images: imageList,
        videos: videoList,
      })
      return {
        imageList,
        videoList,
        needCreateMoment: false,
      }
    }
  }

  return {
    imageList,
    videoList,
    needCreateMoment: true,
  }
}
