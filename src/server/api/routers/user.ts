import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { logger } from '@/server/logger'

export const userRouter = createTRPCRouter({
  current: publicProcedure.query(
    async ({ ctx }) => {
      if (ctx.user) {
        logger.user.debug('Fetching current user', { userId: ctx.user.id })
      }
      return ctx.user
    },
  ),

  updateProfile: protectedProcedure
    .input(z.object({
      nickname: z.string().optional(),
      bio: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id
      logger.user.info('Updating user profile', { userId, ...input })

      const result = await ctx.db.user.update({
        where: { id: userId },
        data: input,
        include: {
          group: true,
        },
      })

      logger.user.info('Profile updated successfully', { userId })
      return result
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id
    logger.user.info('Fetching user stats', { userId })

    // 并发获取各种统计数据
    const [keepCount, todoCount, mindMapCount, momentCount] = await Promise.all([
      ctx.db.keep.count({ where: { ownerId: userId } }),
      ctx.db.todo.count({ where: { ownerId: userId } }),
      ctx.db.mindMap.count({ where: { ownerId: userId } }),
      ctx.db.moment.count({ where: { ownerId: userId } }),
    ])

    logger.user.info('User stats retrieved', { userId, keepCount, todoCount, mindMapCount, momentCount })

    return {
      keepCount,
      todoCount,
      mindMapCount,
      momentCount,
    }
  }),
})
