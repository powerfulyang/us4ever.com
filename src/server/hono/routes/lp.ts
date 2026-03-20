import type { User } from '@/store/user'
import { setCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { sign } from 'hono/jwt'
import { pick } from 'lodash-es'
import { env } from '@/env'
import { app, COOKIE_NAME, COOKIE_OPTIONS } from '@/server/hono'
import { logger } from '@/server/logger'
import { createOrSignIn } from '@/service/user.service'

export function loadLpRouter() {
  app.get('/lp', async (ctx) => {
    const redirect = ctx.req.query('_redirect')
    if (!redirect) {
      logger.lp.error('Missing redirect parameter')
      throw new HTTPException(400, {
        message: 'Missing redirect',
      })
    }
    const ticket = ctx.req.query('ticket')
    logger.lp.info('Processing LP login', { ticket: `${ticket?.substring(0, 8)}...`, redirect })

    const res = await fetch(`https://api.littleeleven.com/api/auth/by-ticket?ticket=${ticket}`)
    if (!res.ok) {
      logger.lp.error('Invalid ticket', { status: res.status })
      throw new HTTPException(400, {
        message: 'Invalid ticket',
      })
    }
    const json = await res.json()
    const user = pick(json.user, ['id', 'nickname', 'email', 'avatar']) as unknown as User
    user.lastLoginAt = new Date()
    user.lastLoginIp = ctx.req.header('X-Forwarded-For') || 'unknown'

    logger.lp.info('User authenticated via LP', { userId: user.id, email: user.email })

    const currentUser = await createOrSignIn(user)
    const token = await sign({ user: currentUser }, env.JWT_SECRET, 'HS256')
    setCookie(ctx, COOKIE_NAME, token, COOKIE_OPTIONS)
    ctx.header('Content-Type', 'text/html; charset=utf-8')
    logger.lp.info('Login successful, redirecting', { userId: currentUser.id, redirect })
    return ctx.body(`<script>window.location.href = '${redirect}';</script>`)
  })

  logger.lp.startup('LP router loaded')
}
