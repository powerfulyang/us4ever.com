import { BasePrimaryKeySchema, QuerySearchSchema, UpdateViewsSchema } from '@/dto/base.dto'
import { createKeepSchema, queryKeepSchema, updateKeepSchema } from '@/dto/keep.dto'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
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
})
