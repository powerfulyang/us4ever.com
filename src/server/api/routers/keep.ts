import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
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
