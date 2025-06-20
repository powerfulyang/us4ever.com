import type { listMoments } from '@/service/moment.service'
import { z } from 'zod'
import { BasePrimaryKeySchema, BaseQuerySchema, QuerySearchSchema, UpdateViewsSchema } from '@/dto/base.dto'
import { PerformanceMonitor } from '@/lib/monitoring'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { momentService } from '@/service/moment.service'

export type Moment = Awaited<ReturnType<typeof listMoments>>[number]

export const momentRouter = createTRPCRouter({
  fetchPublicItems: publicProcedure.query(
    async () => {
      return PerformanceMonitor.measureAsync('moment.fetchPublicItems', async () => {
        return momentService.fetchPublicItems()
      })
    },
  ),

  fetchByCursor: publicProcedure.input(BaseQuerySchema).query(
    async ({ ctx, input }) => {
      return PerformanceMonitor.measureAsync('moment.fetchByCursor', async () => {
        const { limit, cursor, category } = input
        const userIds = ctx.groupUserIds
        return momentService.findMomentsByCursor({ userIds, limit, cursor, category })
      })
    },
  ),

  create: protectedProcedure
    .input(z.object({
      content: z.string(),
      category: z.string().default('default'),
      imageIds: z.array(z.string()).default([]),
      videoIds: z.array(z.string()).default([]),
      isPublic: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      extraData: z.record(z.any()).default({}),
    }))
    .mutation(async ({ input, ctx }) => {
      return PerformanceMonitor.measureAsync('moment.create', async () => {
        const { imageIds, videoIds, ...rest } = input
        const images = imageIds.map((id, index) => ({ id, sort: index }))
        const videos = videoIds.map((id, index) => ({ id, sort: index + imageIds.length }))
        return momentService.createMoment(
          {
            ...rest,
            images,
            videos,
          },
          ctx.user.id,
        )
      })
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      content: z.string(),
      category: z.string(),
      imageIds: z.array(z.string()),
      videoIds: z.array(z.string()),
      tags: z.array(z.string()).default([]),
      extraData: z.record(z.any()).default({}),
    }))
    .mutation(async ({ input, ctx }) => {
      return PerformanceMonitor.measureAsync('moment.update', async () => {
        const { imageIds, videoIds, ...rest } = input
        const images = imageIds.map((id, index) => ({ id, sort: index }))
        const videos = videoIds.map((id, index) => ({ id, sort: index }))
        return momentService.updateMoment(
          {
            ...rest,
            images,
            videos,
          },
          ctx.user.id,
        )
      })
    }),

  delete: protectedProcedure.input(BasePrimaryKeySchema).mutation(
    async ({ input, ctx }) => {
      return PerformanceMonitor.measureAsync('moment.delete', async () => {
        return momentService.deleteMoment(input.id, ctx.user.id)
      })
    },
  ),

  search: publicProcedure.input(QuerySearchSchema).query(
    async ({ input, ctx }) => {
      return PerformanceMonitor.measureAsync('moment.search', async () => {
        const userIds = ctx.groupUserIds
        return momentService.searchAndFetchMoments(input.query, userIds)
      })
    },
  ),

  getById: publicProcedure
    .input(UpdateViewsSchema.merge(BasePrimaryKeySchema))
    .query(
      async ({ input, ctx }) => {
        return PerformanceMonitor.measureAsync('moment.getById', async () => {
          const userIds = ctx.groupUserIds
          const moment = await momentService.getMomentById(input.id, userIds)
          return moment
        })
      },
    ),
})

export interface SearchResult {
  hits: Hits
}

export interface Hits {
  total: Total
  hits: Hit[]
}

export interface Hit {
  _index: string
  _id: string
  _score: number
  _source: Source
  highlight?: Highlight
}

export interface Source {
  content: string
}

export interface Highlight {
  content?: string[]
}

export interface Total {
  value: number
  relation: string
}
