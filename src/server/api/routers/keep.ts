import { BasePrimaryKeySchema, QuerySearchSchema, UpdateViewsSchema } from '@/dto/base.dto'
import { createKeepSchema, queryKeepSchema, updateKeepSchema } from '@/dto/keep.dto'
import { PerformanceMonitor } from '@/lib/monitoring'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { keepService } from '@/service/keep.service'

export const keepRouter = createTRPCRouter({
  fetchPublicItems: publicProcedure.query(
    async () => {
      return PerformanceMonitor.measureAsync('keep.fetchPublicItems', async () => {
        return keepService.findPublicList()
      })
    },
  ),

  fetchByCursor: publicProcedure.input(queryKeepSchema).query(
    async ({ ctx, input }) => {
      return PerformanceMonitor.measureAsync('keep.fetchByCursor', async () => {
        return keepService.findAccessibleList(input, ctx.groupUserIds)
      })
    },
  ),

  create: protectedProcedure.input(createKeepSchema).mutation(
    async ({ input, ctx }) => {
      return PerformanceMonitor.measureAsync('keep.create', async () => {
        return keepService.createKeep(input, ctx.user.id)
      })
    },
  ),

  update: protectedProcedure
    .input(updateKeepSchema.merge(BasePrimaryKeySchema))
    .mutation(
      async ({ input, ctx }) => {
        return PerformanceMonitor.measureAsync('keep.update', async () => {
          const { id, ...data } = input
          return keepService.updateKeep(data, id, ctx.user.id)
        })
      },
    ),

  getById: publicProcedure
    .input(UpdateViewsSchema.merge(BasePrimaryKeySchema))
    .query(async ({ input, ctx }) => {
      return PerformanceMonitor.measureAsync('keep.getById', async () => {
        const userIds = ctx.groupUserIds
        const updateViews = input.updateViews
        return keepService.getKeepById(input.id, userIds, updateViews)
      })
    }),

  delete: protectedProcedure
    .input(BasePrimaryKeySchema)
    .mutation(async ({ input, ctx }) => {
      return PerformanceMonitor.measureAsync('keep.delete', async () => {
        return keepService.deleteKeep(input.id, ctx.user.id)
      })
    }),

  // 透传到 api.us4ever
  search: publicProcedure
    .input(QuerySearchSchema)
    .query(async ({ input, ctx }) => {
      return PerformanceMonitor.measureAsync('keep.search', async () => {
        const userIds = ctx.groupUserIds
        return keepService.searchKeepsWithAccess(input.query, userIds)
      })
    }),
})
