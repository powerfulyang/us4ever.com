import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { z } from 'zod'

export const keepRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        start: z.number().default(0),
        end: z.number().default(50000),
      }).default({
        start: 0,
        end: 50000,
      }),
    )
    .query(async ({ ctx, input }) => {
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
        skip: input.start,
        take: input.end - input.start,
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

  get: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      return await ctx.db.keep.findUnique({
        where: {
          id: input.id,
          ownerId: ctx.user?.id,
        },
      })
    }),
})
