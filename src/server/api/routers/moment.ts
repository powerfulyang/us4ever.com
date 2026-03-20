import type { Prisma } from '@prisma/client'
import type { listMoments } from '@/service/moment.service'
import { z } from 'zod'
import {
  BaseCategoryField,
  BasePageQuerySchema,
  BasePrimaryKeySchema,
  BaseQuerySchema,
  QuerySearchSchema,
  UpdateViewsSchema,
} from '@/dto/base.dto'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { logger } from '@/server/logger'
import { momentService } from '@/service/moment.service'

export type Moment = Awaited<ReturnType<typeof listMoments>>[number]

export const momentRouter = createTRPCRouter({
  fetchPublicItems: publicProcedure.query(
    async () => {
      logger.moment.info('Fetching public moments')
      const result = await momentService.fetchPublicItems()
      logger.moment.info(`Found ${result.length} public moments`)
      return result
    },
  ),

  fetchByCursor: publicProcedure.input(BaseQuerySchema).query(
    async ({ ctx, input }) => {
      const { limit, cursor, category } = input
      const userIds = ctx.groupUserIds
      logger.moment.info('Fetching moments by cursor', { cursor, limit, category })
      const result = await momentService.findMomentsByCursor({ userIds, limit, cursor, category })
      logger.moment.info(`Found ${result.items.length} moments`)
      return result
    },
  ),

  fetchByPage: publicProcedure.input(BasePageQuerySchema).query(
    async ({ ctx, input }) => {
      const { page, pageSize, category } = input
      const userIds = ctx.groupUserIds
      logger.moment.info('Fetching moments by page', { page, pageSize, category })
      const result = await momentService.findMomentsByPage({ userIds, page, pageSize, category })
      logger.moment.info(`Found ${result.items.length} moments`, { total: result.total })
      return result
    },
  ),

  create: protectedProcedure
    .input(z.object({
      content: z.string(),
      category: BaseCategoryField,
      imageIds: z.array(z.string()).default([]),
      videoIds: z.array(z.string()).default([]),
      isPublic: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      extraData: z.record(z.string(), z.any()).default({}),
    }))
    .mutation(async ({ input, ctx }) => {
      const { imageIds, videoIds, ...rest } = input
      const images = imageIds.map((id, index) => ({ id, sort: index }))
      const videos = videoIds.map((id, index) => ({ id, sort: index + imageIds.length }))
      logger.moment.info('Creating new moment', { category: input.category, ownerId: ctx.user.id })
      const result = await momentService.createMoment(
        {
          ...rest,
          extraData: rest.extraData as Prisma.InputJsonValue,
          images,
          videos,
        },
        ctx.user.id,
      )
      logger.moment.info('Moment created successfully', { id: result.id })
      return result
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      content: z.string(),
      category: z.string(),
      imageIds: z.array(z.string()),
      videoIds: z.array(z.string()),
      tags: z.array(z.string()).default([]),
      extraData: z.record(z.string(), z.any()).default({}),
    }))
    .mutation(async ({ input, ctx }) => {
      const { imageIds, videoIds, ...rest } = input
      const images = imageIds.map((id, index) => ({ id, sort: index }))
      const videos = videoIds.map((id, index) => ({ id, sort: index }))
      logger.moment.info('Updating moment', { id: input.id, category: input.category })
      const result = await momentService.updateMoment(
        {
          ...rest,
          extraData: rest.extraData as Prisma.InputJsonValue,
          images,
          videos,
        },
        ctx.user.id,
      )
      logger.moment.info('Moment updated successfully', { id: input.id })
      return result
    }),

  delete: protectedProcedure.input(BasePrimaryKeySchema).mutation(
    async ({ input, ctx }) => {
      logger.moment.info('Deleting moment', { id: input.id, userId: ctx.user.id })
      const result = await momentService.deleteMoment(input.id, ctx.user.id)
      logger.moment.info('Moment deleted successfully', { id: input.id })
      return result
    },
  ),

  search: publicProcedure.input(QuerySearchSchema).query(
    async ({ input, ctx }) => {
      const userIds = ctx.groupUserIds
      logger.moment.info('Searching moments', { query: input.query })
      const result = await momentService.searchAndFetchMoments(input.query, userIds)
      logger.moment.info(`Found ${result.length} search results`)
      return result
    },
  ),

  getById: publicProcedure
    .input(UpdateViewsSchema.merge(BasePrimaryKeySchema))
    .query(
      async ({ input, ctx }) => {
        const userIds = ctx.groupUserIds
        logger.moment.info('Fetching moment by ID', { id: input.id, updateViews: input.updateViews })
        const result = await momentService.getMomentById(input.id, userIds)
        return result
      },
    ),

  getCategories: publicProcedure
    .query(async ({ ctx }) => {
      logger.moment.info('Fetching moment categories')
      const result = await momentService.getCategories(ctx.groupUserIds)
      logger.moment.info(`Found ${result.length} categories`)
      return result
    }),

  semanticSearch: publicProcedure.input(QuerySearchSchema).query(
    async ({ input, ctx }) => {
      const userIds = ctx.groupUserIds
      logger.moment.info('Semantic searching moments', { query: input.query })
      const result = await momentService.semanticSearch(input.query, userIds)
      logger.moment.info(`Found ${result.length} semantic search results`)
      return result
    },
  ),

  hybridSearch: publicProcedure.input(QuerySearchSchema).query(
    async ({ input, ctx }) => {
      const userIds = ctx.groupUserIds
      logger.moment.info('Hybrid searching moments', { query: input.query })
      const result = await momentService.hybridSearch(input.query, userIds)
      logger.moment.info(`Found ${result.totalCount} hybrid search results`)
      return result
    },
  ),

  backfillVectors: protectedProcedure.mutation(async () => {
    logger.moment.info('Starting moment vector backfill process')
    const result = await momentService.backfillVectors()
    logger.moment.info('Moment vector backfill completed', { processed: result.processed })
    return result
  }),
})
