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

export async function sync_telegram(
  offsetId = 0,
  limit = 100,
  channel_name = 'emt_channel',
) {
  const params = new URLSearchParams({
    offsetId: offsetId.toString(),
    limit: limit.toString(),
    download_media: 'true',
    peer: channel_name,
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

export async function handleFile(
  { value: item, category }: TelegramSyncItem,
) {
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
  const filename = path.basename(url.pathname)
  if (groupedId) {
    const moment = await db.moment.findFirst({
      where: {
        category,
        extraData: {
          path: ['groupedId'],
          equals: groupedId,
        },
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
    const imageAlreadyTaken = moment?.images.some(item => item.image.name === filename)
    const videoAlreadyTaken = moment?.videos.some(item => item.video.name === filename)
    if (imageAlreadyTaken || videoAlreadyTaken) {
      console.log('File already taken:', filename)
      return {
        needCreateMoment: false,
      }
    }
  }
  const blob = await fetch(url.toString()).then(res => res.blob())
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
      console.log('addAttachment', exist.id, imageList.map(x => x.id), videoList.map(x => x.id))
      return {
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
