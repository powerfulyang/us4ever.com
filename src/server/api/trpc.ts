/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import type { RequestCookies } from 'next/dist/server/web/spec-extension/cookies'
import { env } from '@/env'
import { db } from '@/server/db'
import { COOKIE_NAME } from '@/server/hono'

import { findUserWithGroupById } from '@/service/user.serivce'
import { initTRPC } from '@trpc/server'
import { HTTPException } from 'hono/http-exception'
import { verify } from 'hono/jwt'
import superjson from 'superjson'
import { ZodError } from 'zod'

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export async function createTRPCContext(opts: {
  headers: Headers
  cookies: RequestCookies
}) {
  return {
    db,
    ...opts,
  }
}

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    if (error.cause instanceof HTTPException) {
      return {
        ...shape,
        data: {
          ...shape.data,
          httpStatus: error.cause.status,
        },
      }
    }
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now()

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100
    await new Promise(resolve => setTimeout(resolve, waitMs))
  }

  const result = await next()

  const end = Date.now()
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`)

  return result
})

const userMiddleware = t.middleware(async ({ ctx, next }) => {
  // 从 cookie 或者 header 或者 url 上的 token 字段获取用户凭证
  const token = ctx.cookies.get(COOKIE_NAME)?.value || ctx.headers.get(COOKIE_NAME)
  let user = null
  let groupUserIds = [] as string[]
  if (token) {
    const secret = env.JWT_SECRET
    try {
      const res = await verify(token, secret) as { user: User }
      user = await findUserWithGroupById(res.user.id)
      groupUserIds = user.group?.users.map(user => user.id) || [user.id]
    }
    catch {
      // ignore error
    }
  }
  return next({
    ctx: {
      ...ctx,
      user,
      groupUserIds,
    },
  })
})

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure
  .use(timingMiddleware)
  .use(userMiddleware)

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(userMiddleware)
  .use(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new HTTPException(401, {
        message: 'Unauthorized',
      })
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    })
  })
