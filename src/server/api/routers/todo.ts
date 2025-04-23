import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { z } from 'zod'

export const todoRouter = createTRPCRouter({
  infinite_list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10 // 默认每页 10 条
      const { cursor } = input
      const userIds = ctx.groupUserIds
      const items = await ctx.db.todo.findMany({
        take: limit + 1, // 获取多一条用于判断是否有下一页
        where: {
          OR: [
            {
              ownerId: {
                in: userIds,
              },
            },
            {
              isPublic: true,
            },
          ],
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [
          {
            pinned: 'desc',
          },
          {
            status: 'asc',
          },
          {
            createdAt: 'desc',
          },
        ],
      })

      let nextCursor: typeof cursor | undefined
      if (items.length > limit) {
        const nextItem = items.pop()
        nextCursor = nextItem!.id
      }
      return {
        items,
        nextCursor,
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().optional(),
        priority: z.number().min(0).default(0),
        dueDate: z.date().optional(),
        isPublic: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.todo.create({
        data: {
          ...input,
          ownerId: ctx.user.id,
        },
      })
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        content: z.string().optional(),
        priority: z.number().min(0),
        dueDate: z.date().optional(),
        isPublic: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.db.todo.update({
        where: {
          id,
          ownerId: ctx.user.id,
        },
        data,
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.todo.delete({
        where: {
          id: input.id,
          ownerId: ctx.user.id,
        },
      })
      return { id: input.id }
    }),

  toggle_status: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.todo.update({
        where: {
          id: input.id,
          ownerId: ctx.user.id,
        },
        data: {
          status: input.status,
        },
      })
    }),

  toggle_public: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isPublic: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.todo.update({
        where: {
          id: input.id,
          ownerId: ctx.user.id,
        },
        data: {
          isPublic: input.isPublic,
        },
      })
    }),

  toggle_pin: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        pinned: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.todo.update({
        where: {
          id: input.id,
          ownerId: ctx.user.id,
        },
        data: {
          pinned: input.pinned,
        },
      })
    }),
})
