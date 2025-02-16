import { enhancement } from '@/lib/deepseek'
import { db } from '@/server/db'
import { app, auth } from '@/server/hono'
import { upload_image, upload_video } from '@/service/file.service'
import { createKeep } from '@/service/keep.service'
import { createMoment, findMoment } from '@/service/moment.service'
import { HTTPException } from 'hono/http-exception'
import { getExtension } from 'hono/utils/mime'

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
  attachments: Attachment[]
  createdAt: Date
}

export function loadSyncRouter() {
  app.use(auth).get('/sync/moment/eleven', async (ctx) => {
    const user = ctx.get('user')
    const res = await fetch('https://worker.powerfulyang.com/api/moment?type=moment')
    if (!res.ok) {
      throw new HTTPException(500, {
        message: await res.text(),
      })
    }
    const json = await res.json()
    const list = json.data as Moment[]

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
            category: 'eleven',
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
            category: 'eleven',
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
        category: 'eleven',
        createdAt: item.createdAt,
      })
    }
    return ctx.json({ success: true })
  })

  app.use(auth).get('/sync/post/powerfulyang', async (ctx) => {
    const user = ctx.get('user')
    const res = await fetch('https://api.powerfulyang.com/api/public/post')
    if (!res.ok) {
      throw new HTTPException(500, {
        message: await res.text(),
      })
    }
    const json = await res.json() as { resources: { id: number }[] }
    const postList = json.resources

    for (const item of postList) {
      const result = await db.keep.findFirst({
        where: {
          category: 'powerfulyang',
          tags: {
            path: ['0', 'id'],
            equals: item.id,
          },
        },
      })
      if (!result) {
        const res = await fetch(`https://api.powerfulyang.com/api/public/post/${item.id}`)
        const json = await res.json() as { content: string, id: number }
        const content = await enhancement(json.content)
        await createKeep({
          content,
          isPublic: true,
          ownerId: user.id,
          category: 'powerfulyang',
          tags: [
            {
              id: json.id,
            },
          ],
        })
      }
    }
    return ctx.json({ success: true })
  })
}
