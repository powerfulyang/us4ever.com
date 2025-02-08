import { env } from '@/env'
import { app, COOKIE_NAME, COOKIE_OPTIONS } from '@/server/hono'
import { createOrSignIn } from '@/service/user.serivce'
import { setCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { sign } from 'hono/jwt'
import { pick } from 'lodash-es'

export function loadLpRouter() {
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
    ctx.header('Content-Type', 'text/html; charset=utf-8')
    return ctx.body(`<script>window.location.href = '${redirect}';</script>`)
  })
}
