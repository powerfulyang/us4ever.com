import type { CookieOptions } from 'hono/utils/cookie'
import { env } from '@/env'
import { upload_image } from '@/service/file.service'
import { createMoment } from '@/service/moment.service'
import { createOrSignIn } from '@/service/user.serivce'
import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { sign, verify } from 'hono/jwt'
import { pick } from 'lodash-es'

export interface AppEnv {
  Variables: {
    user: User
  }
}

export const app = new Hono<AppEnv>().basePath('/api')

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
  if (!redirect) {
    throw new HTTPException(400, {
      message: 'Missing redirect',
    })
  }
  const ticket = ctx.req.query('ticket')
  const res = await fetch(`https://api.littleeleven.com/api/auth/by-ticket?ticket=${ticket}`)
  if (!res.ok) {
    throw new HTTPException(400, {
      message: 'Invalid ticket',
    })
  }
  const json = await res.json()
  const user = pick(json.user, ['id', 'nickname', 'email', 'avatar']) as unknown as User
  user.lastLoginAt = new Date()
  user.lastLoginIp = ctx.req.header('X-Forwarded-For') || 'unknown'
  const currentUser = await createOrSignIn(user)
  const token = await sign({ user: currentUser }, env.JWT_SECRET)
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
