import type { CookieOptions } from 'hono/utils/cookie'
import type { User } from '@/store/user'
import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { verify } from 'hono/jwt'
import { requestId } from 'hono/request-id'
import { env } from '@/env'
import { loadInternalRouter } from '@/server/hono/routes/internal'
import { loadLpRouter } from '@/server/hono/routes/lp'
import { loadSyncTelegramRouter } from '@/server/hono/routes/telegram'
import { loadTtsRouter } from '@/server/hono/routes/tts'
import { logger } from '@/server/logger'

export interface AppEnv {
  Variables: {
    user: User
    requestId: string
  }
}

export const app = new Hono().basePath('/api')

// Request ID 中间件 - 使用 Hono 官方中间件生成唯一追踪 ID
app.use(requestId({
  headerName: 'X-Request-Id',
  limitLength: 255,
}))

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
    const { user } = await verify(token, secret, 'HS256') as { user: User }
    ctx.set('user', user)
    logger.hono.debug('User authenticated', { userId: user.id, url: request_url })
  }
  catch {
    logger.hono.warn('Authentication failed', { url: request_url })
    throw new HTTPException(401, {
      message: `Unauthorized, [url: ${request_url}].`,
    })
  }
  const user = ctx.get('user')
  if (!user.isAdmin) {
    logger.hono.warn('Admin access denied', { userId: user.id, url: request_url })
    throw new HTTPException(403, {
      message: 'Forbidden',
    })
  }
  await next()
})

// 创建子应用
export const protectedRoutes = new Hono<AppEnv>().use(auth)
export const internalRoutes = new Hono()

logger.hono.startup('Loading Hono routers...')

loadLpRouter()
loadSyncTelegramRouter()
loadInternalRouter()
loadTtsRouter()

// 挂载子应用
app.route('/sync', protectedRoutes)
app.route('/internal', internalRoutes)

logger.hono.startup('Hono routers loaded successfully ✅')
