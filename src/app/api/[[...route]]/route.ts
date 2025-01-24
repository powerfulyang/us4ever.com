import type { CookieOptions } from 'hono/utils/cookie'
import { env } from '@/env'
import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { sign } from 'hono/jwt'
import { handle } from 'hono/vercel'

const app = new Hono().basePath('/api')

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

export const GET = handle(app)
export const POST = handle(app)
