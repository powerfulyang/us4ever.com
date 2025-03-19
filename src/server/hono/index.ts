import type { User } from '@/store/user'
import type { CookieOptions } from 'hono/utils/cookie'
import { env } from '@/env'
import { loadLpRouter } from '@/server/hono/routes/lp'
import { loadSyncRouter } from '@/server/hono/routes/sync'
import { loadSyncTelegramRouter } from '@/server/hono/routes/telegram'
import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { verify } from 'hono/jwt'

export interface AppEnv {
  Variables: {
    user: User
  }
}

export const app = new Hono<AppEnv>().basePath('/api')

export const COOKIE_NAME = 'authorization'
export const COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 30, // 30 days
} as CookieOptions

export const auth = createMiddleware(async (ctx, next) => {
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
  const user = ctx.get('user')
  if (!user.isAdmin) {
    throw new HTTPException(403, {
      message: 'Forbidden',
    })
  }
  await next()
})

loadLpRouter()
loadSyncRouter()
loadSyncTelegramRouter()
