import { assetRouter } from '@/server/api/routers/asset'
import { keepRouter } from '@/server/api/routers/keep'
import { userRouter } from '@/server/api/routers/user'
import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc'
import { todoRouter } from './routers/todo'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  asset: assetRouter,
  user: userRouter,
  keep: keepRouter,
  todo: todoRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 */
export const createCaller = createCallerFactory(appRouter)
