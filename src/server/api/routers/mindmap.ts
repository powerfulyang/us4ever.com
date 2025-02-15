import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const mindmapRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.mindMap.findMany({
      where: {
        OR: [
          {
            ownerId: ctx.user?.id,
          },
          {
            isPublic: true,
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }),

  getById: publicProcedure
    .input(z.object({
      id: z.string(),
      updateViews: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const mindmap = await ctx.db.mindMap.findUnique({
        where: {
          id: input.id,
          OR: [
            {
              ownerId: ctx.user?.id,
            },
            {
              isPublic: true,
            },
          ],
        },
      })

      if (!mindmap) {
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
      const editable = mindmap.ownerId === ctx.user?.id

      return {
        ...mindmap,
        editable,
      }
    }),

  createByXmind: protectedProcedure
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
      const mindmap = await ctx.db.mindMap.findUnique({
        where: { id: input.id, ownerId: ctx.user.id },
      })

      if (!mindmap) {
        throw new HTTPException(404, {
          message: 'mind map not found',
        })
      }

      return ctx.db.mindMap.delete({
        where: { id: input.id },
      })
    }),
})
