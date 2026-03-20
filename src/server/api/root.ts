import { assetRouter } from '@/server/api/routers/asset'
import { keepRouter } from '@/server/api/routers/keep'
import { mindMapRouter } from '@/server/api/routers/mindmap'
import { momentRouter } from '@/server/api/routers/moment'
import { userRouter } from '@/server/api/routers/user'
import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc'
import { logger } from '@/server/logger'
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
  mindMap: mindMapRouter,
  moment: momentRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 */
export const createCaller = createCallerFactory(appRouter)

// 记录路由注册完成
logger.trpc.startup('tRPC router initialized with modules: asset, user, keep, todo, mindMap, moment')
