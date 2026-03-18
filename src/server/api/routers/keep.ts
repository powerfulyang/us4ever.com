import { BasePrimaryKeySchema, QuerySearchSchema, UpdateViewsSchema } from '@/dto/base.dto'
import { createKeepSchema, queryKeepPageSchema, queryKeepSchema, semanticSearchSchema, updateKeepSchema } from '@/dto/keep.dto'
import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { keepService } from '@/service/keep.service'

export const keepRouter = createTRPCRouter({
  fetchPublicItems: publicProcedure.query(
    async () => {
      return keepService.findPublicList()
    },
  ),

  fetchByCursor: publicProcedure.input(queryKeepSchema).query(
    async ({ ctx, input }) => {
      return keepService.findAccessibleList(input, ctx.groupUserIds)
    },
  ),

  fetchByPage: publicProcedure.input(queryKeepPageSchema).query(
    async ({ ctx, input }) => {
      return keepService.findAccessiblePage(input, ctx.groupUserIds)
    },
  ),

  create: protectedProcedure.input(createKeepSchema).mutation(
    async ({ input, ctx }) => {
      return keepService.createKeep(input, ctx.user.id)
    },
  ),

  update: protectedProcedure
    .input(updateKeepSchema.merge(BasePrimaryKeySchema))
    .mutation(
      async ({ input, ctx }) => {
        const { id, ...data } = input
        return keepService.updateKeep(data, id, ctx.user.id)
      },
    ),

  getById: publicProcedure
    .input(UpdateViewsSchema.merge(BasePrimaryKeySchema))
    .query(async ({ input, ctx }) => {
      const userIds = ctx.groupUserIds
      const updateViews = input.updateViews
      return keepService.getKeepById(input.id, userIds, updateViews)
    }),

  delete: protectedProcedure
    .input(BasePrimaryKeySchema)
    .mutation(async ({ input, ctx }) => {
      return keepService.deleteKeep(input.id, ctx.user.id)
    }),

  // 透传到 api.us4ever
  search: publicProcedure
    .input(QuerySearchSchema)
    .query(async ({ input, ctx }) => {
      const userIds = ctx.groupUserIds
      return keepService.searchKeepsWithAccess(input.query, userIds)
    }),

  getCategories: publicProcedure
    .query(async ({ ctx }) => {
      return keepService.getCategories(ctx.groupUserIds)
    }),

  // RAG 语义搜索
  semanticSearch: publicProcedure
    .input(semanticSearchSchema)
    .query(async ({ input, ctx }) => {
      return keepService.semanticSearch(input.query, ctx.groupUserIds, input.topK)
    }),

  // 混合搜索：关键词 + 语义
  hybridSearch: publicProcedure
    .input(QuerySearchSchema)
    .query(async ({ input, ctx }) => {
      return keepService.hybridSearch(input.query, ctx.groupUserIds)
    }),

  // 管理员：批量回填向量
  backfillVectors: adminProcedure
    .mutation(async () => {
      return keepService.backfillVectors()
    }),
})
