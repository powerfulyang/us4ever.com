import type { Prisma } from '@prisma/client'
import { z } from 'zod'
import {
  BaseCategoryField,
  BasePrimaryKeySchema,
  BaseQuerySchema,
  QuerySearchSchema,
  UpdateViewsSchema,
} from '@/dto/base.dto'
import { queryMomentPageSchema } from '@/dto/moment.dto'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { db } from '@/server/db'
import { logger } from '@/server/logger'
import { momentService } from '@/service/moment'

export type Moment = Awaited<ReturnType<typeof momentService.listMoments>>[number]

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
      const { limit, cursor, category, visibility } = input
      const userIds = ctx.groupUserIds
      logger.moment.info('Fetching moments by cursor', { cursor, limit, category, visibility })
      const result = await momentService.findMomentsByCursor({ userIds, limit, cursor, category, visibility })
      logger.moment.info(`Found ${result.items.length} moments`)
      return result
    },
  ),

  fetchByPage: publicProcedure.input(queryMomentPageSchema).query(
    async ({ ctx, input }) => {
      const { page, pageSize, category, visibility } = input
      const userIds = ctx.groupUserIds
      logger.moment.info('Fetching moments by page', { page, pageSize, category, visibility })
      const result = await momentService.findMomentsByPage({ userIds, page, pageSize, category, visibility })
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
    .input(z.object({
      visibility: z.enum(['all', 'public', 'private']).default('all').optional(),
    }))
    .query(async ({ ctx, input }) => {
      logger.moment.info('Fetching moment categories', { visibility: input.visibility })
      const result = await momentService.getCategories(ctx.groupUserIds, input.visibility)
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

  // 根据标签查询
  fetchByTag: publicProcedure
    .input(z.object({
      tag: z.string(),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(50).default(10),
      onlyPublic: z.boolean().default(false),
    }))
    .query(async ({ input, ctx }) => {
      const userIds = ctx.groupUserIds
      logger.moment.info('Fetching moments by tag', { tag: input.tag, page: input.page })
      const result = await momentService.findByTag(input.tag, userIds, {
        page: input.page,
        pageSize: input.pageSize,
        onlyPublic: input.onlyPublic,
      })
      logger.moment.info(`Found ${result.items.length} moments by tag`, { tag: input.tag, total: result.total })
      return result
    }),

  // 获取所有标签（带统计）
  getTags: publicProcedure
    .query(async ({ ctx }) => {
      const userIds = ctx.groupUserIds
      logger.moment.info('Fetching moment tags')

      // 查询所有不同的标签
      const moments = await db.moment.findMany({
        where: {
          OR: [
            { ownerId: { in: userIds } },
            { isPublic: true },
          ],
        },
        select: {
          tags: true,
        },
      })

      // 统计标签使用次数
      const tagCount = new Map<string, number>()
      moments.forEach((moment) => {
        const tags = moment.tags as string[]
        tags.forEach((tag) => {
          tagCount.set(tag, (tagCount.get(tag) || 0) + 1)
        })
      })

      const tags = Array.from(tagCount.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)

      logger.moment.info(`Found ${tags.length} unique tags`)
      return tags
    }),

  backfillVectors: protectedProcedure.mutation(async () => {
    logger.moment.info('Starting moment vector backfill process')
    const result = await momentService.backfillVectors()
    logger.moment.info('Moment vector backfill completed', { processed: result.processed })
    return result
  }),
})
