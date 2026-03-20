import { BasePrimaryKeySchema, QuerySearchSchema, UpdateViewsSchema } from '@/dto/base.dto'
import { createKeepSchema, queryKeepPageSchema, queryKeepSchema, semanticSearchSchema, updateKeepSchema } from '@/dto/keep.dto'
import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { logger } from '@/server/logger'
import { keepService } from '@/service/keep.service'

export type Keep = Awaited<ReturnType<typeof keepService.findPublicList>>[number]

export const keepRouter = createTRPCRouter({
  fetchPublicItems: publicProcedure.query(
    async () => {
      logger.keep.info('Fetching public keep items')
      const result = await keepService.findPublicList()
      logger.keep.info(`Found ${result.length} public items`)
      return result
    },
  ),

  fetchByCursor: publicProcedure.input(queryKeepSchema).query(
    async ({ ctx, input }) => {
      logger.keep.info('Fetching keep items by cursor', { cursor: input.cursor, limit: input.limit })
      const result = await keepService.findAccessibleList(input, ctx.groupUserIds)
      logger.keep.info(`Found ${result.items.length} items`, { nextCursor: result.nextCursor })
      return result
    },
  ),

  fetchByPage: publicProcedure.input(queryKeepPageSchema).query(
    async ({ ctx, input }) => {
      logger.keep.info('Fetching keep items by page', { page: input.page, pageSize: input.pageSize })
      const result = await keepService.findAccessiblePage(input, ctx.groupUserIds)
      logger.keep.info(`Found ${result.items.length} items`, { total: result.total })
      return result
    },
  ),

  create: protectedProcedure.input(createKeepSchema).mutation(
    async ({ input, ctx }) => {
      logger.keep.info('Creating new keep', { ownerId: ctx.user.id })
      const result = await keepService.createKeep(input, ctx.user.id)
      logger.keep.info('Keep created successfully', { id: result.id })
      return result
    },
  ),

  update: protectedProcedure
    .input(updateKeepSchema.merge(BasePrimaryKeySchema))
    .mutation(
      async ({ input, ctx }) => {
        const { id, ...data } = input
        logger.keep.info('Updating keep', { id, title: data.title })
        const result = await keepService.updateKeep(data, id, ctx.user.id)
        logger.keep.info('Keep updated successfully', { id })
        return result
      },
    ),

  getById: publicProcedure
    .input(UpdateViewsSchema.merge(BasePrimaryKeySchema))
    .query(async ({ input, ctx }) => {
      const userIds = ctx.groupUserIds
      logger.keep.info('Fetching keep by ID', { id: input.id, updateViews: input.updateViews })
      const result = await keepService.getKeepById(input.id, userIds, input.updateViews)
      return result
    }),

  delete: protectedProcedure
    .input(BasePrimaryKeySchema)
    .mutation(async ({ input, ctx }) => {
      logger.keep.info('Deleting keep', { id: input.id, userId: ctx.user.id })
      const result = await keepService.deleteKeep(input.id, ctx.user.id)
      logger.keep.info('Keep deleted successfully', { id: input.id })
      return result
    }),

  // 关键词搜索
  search: publicProcedure
    .input(QuerySearchSchema)
    .query(async ({ input, ctx }) => {
      logger.keep.info('Searching keeps', { query: input.query, topK: input.topK })
      const result = await keepService.searchKeepsWithAccess(input.query, ctx.groupUserIds, input.topK)
      logger.keep.info('Search completed')
      return result
    }),

  getCategories: publicProcedure
    .query(async ({ ctx }) => {
      logger.keep.info('Fetching keep categories')
      const result = await keepService.getCategories(ctx.groupUserIds)
      logger.keep.info(`Found ${result.length} categories`)
      return result
    }),

  // RAG 语义搜索
  semanticSearch: publicProcedure
    .input(semanticSearchSchema)
    .query(async ({ input, ctx }) => {
      logger.keep.info('Semantic searching keeps', { query: input.query, topK: input.topK })
      const result = await keepService.semanticSearch(input.query, ctx.groupUserIds, input.topK)
      logger.keep.info(`Found ${result.length} semantic search results`)
      return result
    }),

  // 混合搜索：关键词 + 语义
  hybridSearch: publicProcedure
    .input(QuerySearchSchema)
    .query(async ({ input, ctx }) => {
      logger.keep.info('Hybrid searching keeps', { query: input.query, topK: input.topK })
      const result = await keepService.hybridSearch(input.query, ctx.groupUserIds, input.topK)
      logger.keep.info(`Found ${result.totalCount} hybrid search results`)
      return result
    }),

  // 管理员：批量回填向量
  backfillVectors: adminProcedure
    .mutation(async () => {
      logger.keep.info('Starting vector backfill process')
      const result = await keepService.backfillVectors()
      logger.keep.info('Vector backfill completed', { processed: result.processed })
      return result
    }),
})
