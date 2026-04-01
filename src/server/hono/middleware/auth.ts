import type { CookieOptions } from 'hono/utils/cookie'
import type { AppEnv } from '@/server/hono'
import type { User } from '@/store/user'
import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { verify } from 'hono/jwt'
import { env } from '@/env'
import { logger } from '@/server/logger'

export const COOKIE_NAME = 'authorization'
export const COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'lax', // 从 strict 改为 lax 以支持点击链接时 ssr 能够获取 cookie
  maxAge: 60 * 60 * 24 * 30, // 30 days
} as CookieOptions

/**
 * Admin auth middleware - 需要管理员权限
 * 包含认证和 isAdmin 检查
 */
export const auth = createMiddleware<AppEnv>(async (ctx, next) => {
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
