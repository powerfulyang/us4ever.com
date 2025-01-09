import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'

export const keepRouter = createTRPCRouter({
  list: publicProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.keep.findMany({
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

  create: protectedProcedure
    .input(z.object({
      content: z.string(),
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.keep.create({
        data: {
          ...input,
          ownerId: ctx.user.id,
        },
      })
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      content: z.string(),
      isPublic: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.keep.update({
        where: {
          id: input.id,
          ownerId: ctx.user.id,
        },
        data: {
          content: input.content,
          isPublic: input.isPublic,
          // 清空 title 和 summary
          title: '',
          summary: '',
        },
      })
    }),

  getById: publicProcedure
    .input(z.object({
      id: z.string(),
      updateViews: z.boolean().default(false),
    }))
    .query(async ({ input, ctx }) => {
      const keep = await ctx.db.keep.findUnique({
        where: {
          id: input.id,
          OR: [
            { ownerId: ctx.user?.id },
            { isPublic: true },
          ],
        },
      })

      if (!keep) {
        throw new HTTPException(404, {
          message: 'Keep not found',
        })
      }

      if (input.updateViews) {
        // 更新浏览次数
        await ctx.db.keep.update({
          where: { id: input.id },
          data: { views: { increment: 1 } },
        })
      }

      return keep
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.keep.delete({
        where: {
          id: input.id,
          ownerId: ctx.user.id,
        },
      })
    }),
})
