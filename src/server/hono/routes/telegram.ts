import type { TelegramMessage } from '@/lib/sync.telegram'
import type { MomentImage, MomentVideo } from '@/service/moment.service'
import { env } from '@/env'
import { syncTelegram } from '@/lib/sync.telegram'
import { db } from '@/server/db'
import { app, auth } from '@/server/hono'
import { upload_image, upload_video } from '@/service/file.service'
import { addMomentAttachment, createMoment } from '@/service/moment.service'
import {
  bufferTime,
  catchError,
  concatMap,
  distinct,
  EMPTY,
  from,
  mergeMap,
  Subject,
  tap,
} from 'rxjs'

// 创建一个 Subject 来接收所有同步请求的数据
const telegramSync$ = new Subject<TelegramMessage & {
  ownerId: string
}>()

// 处理同步逻辑
const syncProcessor$ = telegramSync$.pipe(
  bufferTime(1000), // 缓冲 1 秒内的所有请求
  mergeMap(items => from(items)), // 展平数组
  distinct(item => item.id), // 确保消息 ID 唯一性
  concatMap(async (item) => {
    const category = 'telegram:emt_channel'
    const exist = await db.moment.findFirst({
      where: {
        category,
        extraData: {
          path: ['id'],
          equals: item.id,
        },
      },
    })
    if (exist) {
      return 'Moment already exists'
    }
    const content = item.message || ''
    // 根据 groupedId 查询
    const groupedId = item.groupedId
    const filePath = item.filePath
    // download file
    const blob = await fetch(`${env.TELEGRAM_API_ENDPOINT}/${filePath}`).then(res => res.blob())
    const file = new File([blob], 'telegram-file', { type: blob.type })
    // 上传文件
    const imageList: MomentImage[] = []
    const videoList: MomentVideo[] = []
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
        return 'GroupedId already exists, add attachment'
      }
    }
    await createMoment({
      content,
      isPublic: true,
      ownerId: item.ownerId,
      category,
      extraData: {
        id: item.id,
        groupedId: item.groupedId,
      },
      images: imageList,
      videos: videoList,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    })
    return 'Create new moment'
  }),
  tap((result) => {
    console.log('Sync result:', result)
  }),
  catchError((error) => {
    console.error('Error processing telegram sync:', error)
    return EMPTY
  }),
)

// 启动处理器
syncProcessor$.subscribe()

export function loadSyncTelegramRouter() {
  app.use(auth).get('/sync/telegram/emt_channel', async (ctx) => {
    const user = ctx.get('user')
    const posts = await syncTelegram()

    // 将新的同步数据推送到 Subject
    posts.forEach((post) => {
      telegramSync$.next({
        ownerId: user.id,
        ...post,
      })
    })

    return ctx.json({ success: true })
  })
}
