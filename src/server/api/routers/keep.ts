import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { after } from 'next/server'
import { z } from 'zod'

export const keepRouter = createTRPCRouter({
  list_public: publicProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.keep.findMany({
        where: {
          isPublic: true,
        },
        select: {
          id: true,
          updatedAt: true,
        },
      })
    }),

  infinite_list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(), // <-- "cursor" needs to exist, but can be any type
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 6 // Default limit
      const { cursor } = input
      const items = await ctx.db.keep.findMany({
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
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
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
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
            // Allow owner to see their own private keeps
            { ownerId: ctx.user?.id },
            // Allow anyone to see public keeps
            { isPublic: true },
          ],
        },
      })

      // Only increment views if not the owner
      if (keep && input.updateViews && keep.ownerId !== ctx.user?.id) {
        // Update view count asynchronously (fire-and-forget) for better performance
        after(ctx.db.keep.update({
          where: { id: input.id },
          data: { views: { increment: 1 } },
        }))
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
