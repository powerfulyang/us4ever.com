import { z } from 'zod'
import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'

export const userRouter = createTRPCRouter({
  current: publicProcedure.query(
    async ({ ctx }) => {
      return ctx.user
    },
  ),

  // 获取用户列表（仅管理员）
  list: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input

      const [users, total] = await Promise.all([
        ctx.db.user.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            group: true,
          },
        }),
        ctx.db.user.count(),
      ])

      return {
        users,
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
      }
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      nickname: z.string().optional(),
      bio: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id

      return ctx.db.user.update({
        where: { id: userId },
        data: input,
        include: {
          group: true,
        },
      })
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id

    // 并发获取各种统计数据
    const [keepCount, todoCount, mindMapCount, momentCount] = await Promise.all([
      ctx.db.keep.count({ where: { ownerId: userId } }),
      ctx.db.todo.count({ where: { ownerId: userId } }),
      ctx.db.mindMap.count({ where: { ownerId: userId } }),
      ctx.db.moment.count({ where: { ownerId: userId } }),
    ])

    return {
      keepCount,
      todoCount,
      mindMapCount,
      momentCount,
    }
  }),
})
