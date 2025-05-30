import { HTTPException } from 'hono/http-exception'
import { getExtension } from 'hono/utils/mime'
import { db } from '@/server/db'
import { protectedRoutes } from '@/server/hono'
import { upload_image, upload_video } from '@/service/file.service'
import { createMoment, findMoment } from '@/service/moment.service'

interface Attachment {
  id: number
  hash: string
  thumbnailHash: string
  mediaType: string
  bucket: {
    name: string
    domain: string
  }
}

interface Moment {
  id: number
  content: string
  attachments?: Attachment[]
  assets?: Attachment[]
  createdAt: Date
}

export function loadSyncRouter() {
  protectedRoutes.get('/moment/eleven', async (ctx) => {
    const user = ctx.get('user')
    const res = await fetch('https://worker.powerfulyang.com/api/moment?type=moment')
    if (!res.ok) {
      throw new HTTPException(500, {
        message: await res.text(),
      })
    }
    const json = await res.json()
    const list = json.data as Moment[]
    const category = 'eleven'

    for (const item of list) {
      // find moment
      const moment = await findMoment(item.content, item.createdAt)
      if (moment) {
        // skip
        continue
      }
      const attachments = (item.attachments || [])
        .map((attachment, index) => {
          return {
            id: attachment.id,
            type: attachment.mediaType,
            url: `https://${attachment.bucket.domain}/${attachment.hash}`,
            sort: index,
          }
        })
      const content = item.content

      const images = []
      const videos = []
      // 上传图片
      for (const attachment of attachments) {
        // 下载
        const res = await fetch(attachment.url)
        const blob = await res.blob()
        const mimeType = attachment.type
        const extension = getExtension(mimeType)
        if (attachment.type.startsWith('image/')) {
          const file = new File([blob], `${attachment.id}.${extension}`, {
            type: mimeType,
          })
          const json = await upload_image({
            file,
            uploadedBy: user.id,
            category,
          })
          images.push({
            id: json.id,
            sort: attachment.sort,
          })
        }
        if (attachment.type.startsWith('video/')) {
          const file = new File([blob], `${attachment.id}.${extension}`, {
            type: mimeType,
          })
          const json = await upload_video({
            file,
            uploadedBy: user.id,
            category,
          })
          videos.push({
            id: json.id,
            sort: attachment.sort,
          })
        }
      }

      await createMoment({
        ownerId: user.id,
        content,
        images,
        videos,
        category,
        createdAt: item.createdAt,
      })
    }
    return ctx.json({ success: true })
  })

  protectedRoutes.get('/moment/powerfulyang', async (ctx) => {
    const user = ctx.get('user')
    const res = await fetch('https://api.powerfulyang.com/api/public/feed')
    if (!res.ok) {
      throw new HTTPException(500, {
        message: await res.text(),
      })
    }
    const json = await res.json()
    const list = json.resources as Moment[]
    const category = 'powerfulyang'

    const array = []

    for (const item of list) {
      const content = item.content
      const createdAt = item.createdAt
      const updatedAt = item.createdAt
      // find moment
      const moment = await findMoment(content, createdAt)
      const assets = (item.assets || [])
      if (moment || assets.length) {
        // skip
        continue
      }
      array.push({
        isPublic: true,
        ownerId: user.id,
        content,
        category,
        createdAt,
        updatedAt,
      })
    }

    await db.moment.createMany({
      data: array,
    })

    return ctx.json({ success: true })
  })

  protectedRoutes.get('/post/powerfulyang', async (ctx) => {
    const user = ctx.get('user')
    const res = await fetch('https://api.powerfulyang.com/api/public/post')
    if (!res.ok) {
      throw new HTTPException(500, {
        message: await res.text(),
      })
    }
    const json = await res.json()
    const postList = json.resources
    const category = 'powerfulyang'

    const array = []

    for (const item of postList) {
      const result = await db.keep.findFirst({
        where: {
          category,
          extraData: {
            path: ['id'],
            equals: item.id,
          },
        },
      })
      if (!result) {
        const res = await fetch(`https://api.powerfulyang.com/api/public/post/${item.id}`)
        const json = await res.json()
        const content = json.content
        const createdAt = json.createdAt
        const updatedAt = json.updatedAt
        array.push({
          content,
          isPublic: true,
          ownerId: user.id,
          category,
          extraData: {
            id: item.id,
          },
          createdAt,
          updatedAt,
        })
      }
    }

    await db.keep.createMany({
      data: array,
    })

    return ctx.json({ success: true })
  })
}
