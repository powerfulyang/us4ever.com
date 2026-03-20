/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import type { RequestCookies } from 'next/dist/server/web/spec-extension/cookies'
import type { User } from '@/store/user'
import { initTRPC } from '@trpc/server'
import { verify } from 'hono/jwt'

import superjson from 'superjson'
import { ZodError } from 'zod'
import { env } from '@/env'
import { createError, logError, sanitizeError, toTRPCError, transformError } from '@/lib/error-handler'
import { db } from '@/server/db'
import { COOKIE_NAME } from '@/server/hono'
import { logger, runWithRequestId } from '@/server/logger'
import { findUserWithGroupById } from '@/service/user.service'
import { getOrGenerateRequestId } from '@/utils/request-id'

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
  errorFormatter({ shape, error, path, type }) {
    // 使用统一的错误处理系统
    const appError = transformError(error.cause || error)

    // 记录错误日志
    logError(appError, {
      trpcPath: path,
      trpcType: type,
    })

    // 返回安全的错误信息
    const sanitized = sanitizeError(appError, env.NODE_ENV === 'production')

    return {
      ...shape,
      data: {
        ...shape.data,
        code: sanitized.code,
        httpStatus: sanitized.statusCode,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
      message: sanitized.message,
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
 * Middleware for setting up requestId context
 * 这个中间件应该放在最外层，确保后续所有中间件和 resolver 都能获取到 requestId
 */
const requestIdMiddleware = t.middleware(async ({ next, ctx }) => {
  return await runWithRequestId(
    getOrGenerateRequestId(ctx.headers),
    async () => {
      return await next()
    },
  )
})

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path, type }) => {
  const start = Date.now()

  logger.trpc.apiCall(type.toUpperCase(), `/api/trpc/${path}`)

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100
    await new Promise(resolve => setTimeout(resolve, waitMs))
  }

  const result = await next()

  const duration = Date.now() - start
  logger.trpc.apiResponse(type.toUpperCase(), `/api/trpc/${path}`, duration)

  return result
})

const userMiddleware = t.middleware(async ({ ctx, next, path }) => {
  // 从 cookie 或者 header 或者 url 上的 token 字段获取用户凭证
  const token = ctx.cookies.get(COOKIE_NAME)?.value || ctx.headers.get(COOKIE_NAME)
  let user = null
  let groupUserIds = [] as string[]
  if (token) {
    const secret = env.JWT_SECRET
    try {
      const res = await verify(token, secret, 'HS256') as { user: User }
      user = await findUserWithGroupById(res.user.id)
      groupUserIds = user.group?.users.map(user => user.id) || [user.id]
      logger.trpc.debug('User authenticated', { userId: user.id, path })
    }
    catch {
      logger.trpc.warn('Token verification failed', { path })
    }
  }
  else {
    logger.trpc.debug('Anonymous request', { path })
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
  .use(requestIdMiddleware)
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
  .use(requestIdMiddleware)
  .use(timingMiddleware)
  .use(userMiddleware)
  .use(async ({ ctx, next, path }) => {
    if (!ctx.user) {
      logger.trpc.warn('Unauthorized access attempt', { path })
      throw toTRPCError(createError.unauthorized())
    }
    logger.trpc.debug('Protected procedure accessed', { userId: ctx.user.id, path })
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    })
  })

export const adminProcedure = protectedProcedure
  .use(async ({ ctx, next, path }) => {
    if (!ctx.user?.isAdmin) {
      logger.trpc.warn('Forbidden access attempt', { userId: ctx.user?.id, path })
      throw toTRPCError(createError.forbidden())
    }
    logger.trpc.debug('Admin procedure accessed', { userId: ctx.user.id, path })
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    })
  })
