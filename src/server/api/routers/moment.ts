import type { listMoments } from '@/service/moment.service'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { db } from '@/server/db'
import { imageInclude, transformImageToResponse } from '@/service/asset.service'
import { createMoment, deleteMoment, updateMoment } from '@/service/moment.service'
import { z } from 'zod'

export type Moment = Awaited<ReturnType<typeof listMoments>>[number]

export const momentRouter = createTRPCRouter({
  infinite_list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
        category: z.string().optional(),
      }).default({}),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, category } = input
      const userIds = ctx.groupUserIds

      const items = await db.moment.findMany({
        include: {
          images: {
            include: {
              image: {
                include: imageInclude,
              },
            },
            orderBy: {
              sort: 'asc',
            },
          },
          owner: true,
        },
        where: {
          OR: [
            {
              ownerId: {
                in: userIds,
              },
              category,
            },
            { isPublic: true, category },
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
        items: items.map(moment => ({
          ...moment,
          images: moment.images.map(({ image }) => transformImageToResponse(image)),
        })),
        nextCursor,
      }
    }),

  create: protectedProcedure
    .input(z.object({
      content: z.string(),
      category: z.string().default('default'),
      imageIds: z.array(z.string()),
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const { imageIds, ...rest } = input
      const images = imageIds.map((id, index) => ({ id, sort: index }))
      return createMoment({
        ...rest,
        images,
        ownerId: ctx.user.id,
      })
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      content: z.string(),
      category: z.string(),
      imageIds: z.array(z.string()),
    }))
    .mutation(async ({ input, ctx }) => {
      return updateMoment({
        ...input,
        ownerId: ctx.user.id,
      })
    }),

  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      return deleteMoment(input.id, ctx.user.id)
    }),
})
