import type { CookieOptions } from 'hono/utils/cookie'
import type { User } from '@/store/user'
import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { cors } from 'hono/cors'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { verify } from 'hono/jwt'
import { env } from '@/env'
import { loadBucketRouter } from '@/server/hono/routes/bucket'
import { loadInternalRouter } from '@/server/hono/routes/internal'
import { loadLpRouter } from '@/server/hono/routes/lp'
import { loadSyncRouter } from '@/server/hono/routes/sync'
import { loadSyncTelegramRouter } from '@/server/hono/routes/telegram'

export interface AppEnv {
  Variables: {
    user: User
  }
}

export const app = new Hono().basePath('/api')

export const COOKIE_NAME = 'authorization'
export const COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'lax', // 从 strict 改为 lax 以支持点击链接时 ssr 能够获取 cookie
  maxAge: 60 * 60 * 24 * 30, // 30 days
} as CookieOptions

export const auth = createMiddleware(async (ctx, next) => {
  const token = getCookie(ctx, COOKIE_NAME) || ''
  const secret = env.JWT_SECRET
  const request_url = ctx.req.url
  try {
    const { user } = await verify(token, secret) as { user: User }
    ctx.set('user', user)
  }
  catch {
    throw new HTTPException(401, {
      message: `Unauthorized, [url: ${request_url}].`,
    })
  }
  const user = ctx.get('user')
  if (!user.isAdmin) {
    throw new HTTPException(403, {
      message: 'Forbidden',
    })
  }
  await next()
})

// 创建子应用
export const protectedRoutes = new Hono<AppEnv>().use(auth)
export const internalRoutes = new Hono()

loadLpRouter()
loadSyncRouter()
loadSyncTelegramRouter()
loadBucketRouter()
loadInternalRouter()

// 挂载子应用
app.route('/sync', protectedRoutes)
app.route('/internal', internalRoutes)

app.use(cors()).post('/proxy', async (ctx) => {
  const formData = await ctx.req.formData()
  const res = await fetch('https://im.gurl.eu.org/upload', {
    method: 'POST',
    body: formData,
  })
  const json = await res.json()
  return ctx.json(json)
})
