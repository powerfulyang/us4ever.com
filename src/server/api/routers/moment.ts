import type { listMoments } from '@/service/moment.service'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { db } from '@/server/db'
import { imageInclude, transformImageToResponse, transformVideoToResponse, videoInclude } from '@/service/asset.service'
import { createMoment, deleteMoment, getMomentById, updateMoment } from '@/service/moment.service'
import { map } from 'lodash-es'
import { after } from 'next/server'
import { z } from 'zod'

export type Moment = Awaited<ReturnType<typeof listMoments>>[number]

export const momentRouter = createTRPCRouter({
  list_public: publicProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.moment.findMany({
        where: {
          isPublic: true,
        },
        select: {
          id: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      })
    }),

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
          videos: {
            include: {
              video: {
                include: videoInclude,
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
          videos: moment.videos.map(({ video }) => transformVideoToResponse(video)),
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

  search: publicProcedure
    .input(z.object({
      query: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      if (!input.query.trim()) {
        return []
      }
      const result = await searchMoments(input.query)
      const ids = map(result, 'id')
      const userIds = ctx.groupUserIds
      const list = await db.moment.findMany({
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
          videos: {
            include: {
              video: {
                include: videoInclude,
              },
            },
            orderBy: {
              sort: 'asc',
            },
          },
          owner: true,
        },
        where: {
          id: {
            in: ids,
          },
          OR: [
            {
              ownerId: {
                in: userIds,
              },
            },
            { isPublic: true },
          ],
        },
      })

      return list.map(moment => ({
        ...moment,
        images: moment.images.map(({ image }) => transformImageToResponse(image)),
        videos: moment.videos.map(({ video }) => transformVideoToResponse(video)),
      }))
    }),

  getById: publicProcedure
    .input(z.object({
      id: z.string(),
      updateViews: z.boolean().default(false),
    }))
    .query(async ({ input, ctx }) => {
      const userIds = ctx.groupUserIds
      const moment = await getMomentById(input.id, userIds)
      // Only increment views if not the owner
      if (moment && input.updateViews && moment.ownerId !== ctx.user?.id) {
        // Update view count asynchronously (fire-and-forget) for better performance
        after(ctx.db.moment.update({
          where: { id: input.id },
          data: { views: { increment: 1 } },
        }))
      }
      return moment
    }),
})

interface SearchResult {
  id: string
}

async function searchMoments(searchTerm: string): Promise<SearchResult[]> {
  const response = await fetch(`http://tools.us4ever.com:8080/internal/moments/search?q=${encodeURIComponent(searchTerm)}`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return (await response.json() || [])
}
