import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const mindMapRouter = createTRPCRouter({
  infinite_list: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(6),
      cursor: z.string().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input
      const userIds = ctx.groupUserIds
      const items = await ctx.db.mindMap.findMany({
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
        orderBy: {
          createdAt: 'desc',
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
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

  getById: publicProcedure
    .input(z.object({
      id: z.string(),
      updateViews: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const userIds = ctx.groupUserIds
      const mindMap = await ctx.db.mindMap.findUnique({
        where: {
          id: input.id,
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
      })

      if (!mindMap) {
        throw new HTTPException(404, {
          message: 'mind map not found',
        })
      }

      if (input.updateViews) {
        // 更新浏览次数
        await ctx.db.mindMap.update({
          where: { id: input.id },
          data: { views: { increment: 1 } },
        })
      }
      const editable = mindMap.ownerId === ctx.user?.id

      return {
        ...mindMap,
        editable,
      }
    }),

  createByXMind: protectedProcedure
    .input(z.object({
      title: z.string().optional(),
      content: z.record(z.any()),
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.mindMap.create({
        data: {
          ...input,
          ownerId: ctx.user.id,
        },
      })
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      isPublic: z.boolean(),
      title: z.string(),
      content: z.record(z.any()),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.mindMap.update({
        where: { id: input.id, ownerId: ctx.user.id },
        data: { ...input },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const mindMap = await ctx.db.mindMap.findUnique({
        where: { id: input.id, ownerId: ctx.user.id },
      })

      if (!mindMap) {
        throw new HTTPException(404, {
          message: 'mind map not found',
        })
      }

      return ctx.db.mindMap.delete({
        where: { id: input.id },
      })
    }),
})
