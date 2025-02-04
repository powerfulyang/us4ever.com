import type { CookieOptions } from 'hono/utils/cookie'
import { env } from '@/env'
import { upload_image } from '@/service/file.service'
import { createMoment } from '@/service/moment.service'
import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { sign, verify } from 'hono/jwt'
import { handle } from 'hono/vercel'

export interface AppEnv {
  Variables: {
    user: User
  }
}

const app = new Hono<AppEnv>().basePath('/api')

export const COOKIE_NAME = 'authorization'
const COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 30, // 30 days
} as CookieOptions

app.get('/lp', async (ctx) => {
  const redirect = ctx.req.query('_redirect')
  const ticket = ctx.req.query('ticket')
  const res = await fetch(`https://api.littleeleven.com/api/auth/by-ticket?ticket=${ticket}`)
  const json = await res.json()
  const user = json.user
  const token = await sign({ user }, env.JWT_SECRET)

  if (!redirect) {
    throw new HTTPException(400, {
      message: 'Missing redirect',
    })
  }
  setCookie(ctx, COOKIE_NAME, token, COOKIE_OPTIONS)
  return ctx.redirect(redirect)
})

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

const auth = createMiddleware(async (ctx, next) => {
  const token = getCookie(ctx, COOKIE_NAME) || ''
  const secret = env.JWT_SECRET
  try {
    const { user } = await verify(token, secret) as { user: User }
    ctx.set('user', user)
  }
  catch {
    throw new HTTPException(401, {
      message: 'Unauthorized',
    })
  }
  await next()
})

app.use(auth).get('/sync/moment/eleven', async (ctx) => {
  const user = ctx.get('user')
  const res = await fetch('https://worker.powerfulyang.com/api/moment?type=moment')
  const json = await res.json()
  /**
   * {
   *     "data": [
   *         {
   *             "id": 75,
   *             "content": "今天是断奶第四天。你的胃口从早上七点半醒来以后变得蛮好，妈妈很欣慰，宝宝真的要开始独立吃饭了。妈妈的胸部 痛感明显降低了，胀感还在，相信再过几天就能恢复好。照片是你在吃完早餐（50毫升奶粉+1个鸡蛋的蛋白+一块土豆菠菜鲜虾饼）以后 去乐山绿地玩了将近一个小时回来 又刚刚加餐（两块鲜虾饼+一块威化饼干）之后拍的，水喝的不够……继续玩了一会，哄了两下就睡着了。等你醒后再继续引导你多喝水。",
   *             "createdAt": "2025-02-01T04:10:56.477Z",
   *             "updatedAt": "2025-02-01T04:10:56.477Z",
   *             "attachments": [
   *                 {
   *                     "id": 216,
   *                     "hash": "fd5deff51d0060accd983b0d327cce232ceaecdd",
   *                     "thumbnailHash": "b864e93484336cfa29000f5bce4e845e6d9a2684",
   *                     "mediaType": "image/jpeg",
   *                     "bucket": {
   *                         "name": "eleven",
   *                         "domain": "r2.littleeleven.com"
   *                     }
   *                 },
   *                 {
   *                     "id": 217,
   *                     "hash": "3da82819e86fcb026ad3f97ddd095cacd4f25460",
   *                     "thumbnailHash": "914e13fd5650e4310fe01a6d3d604e5a1bb0b676",
   *                     "mediaType": "image/jpeg",
   *                     "bucket": {
   *                         "name": "eleven",
   *                         "domain": "r2.littleeleven.com"
   *                     }
   *                 }
   *             ]
   *         },
   *         ]
   * }
   */

  const list = json.data
  for (const item of list) {
    const attachments = (item.attachments || []) as Attachment[]
    const content = item.content as string
    const images = attachments
      .filter(attachment => attachment.mediaType.startsWith('image'))
      .map((attachment) => {
        return {
          id: attachment.id,
          url: `https://${attachment.bucket.domain}/${attachment.hash}`,
        }
      })

    const image_ids = []
    // 上传图片
    for (const image of images) {
      // 下载
      const res = await fetch(image.url)
      const blob = await res.blob()
      const file = new File([blob], `${image.id}.jpeg`, {
        type: blob.type,
      })
      const json = await upload_image({
        file,
        uploadedBy: user.id,
      })
      image_ids.push(json.id)
    }

    await createMoment({
      ownerId: user.id,
      content,
      imageIds: image_ids,
      category: 'eleven',
      createdAt: item.createdAt,
    })
  }
  return ctx.json({ success: true })
})

export const GET = handle(app)
export const POST = handle(app)
