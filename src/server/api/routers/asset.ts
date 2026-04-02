import type { RouterOutputs } from '@/trpc/react'
import { BasePageQuerySchema, BasePrimaryKeySchema, BaseQuerySchema } from '@/dto/base.dto'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc'
import { logger } from '@/server/logger'
import { assetService } from '@/service/asset.service'

export type Image = RouterOutputs['asset']['fetchImagesByCursor']['items'][number]
export type Video = RouterOutputs['asset']['fetchVideosByCursor']['items'][number]

export const assetRouter = createTRPCRouter({
  fetchImagesByCursor: publicProcedure.input(BaseQuerySchema).query(
    async ({ ctx, input }) => {
      const { limit, cursor, category } = input
      logger.asset.info('Fetching images by cursor', { cursor, limit, category })
      const items = await assetService.findImagesByCursor({
        userIds: ctx.groupUserIds,
        take: limit + 1,
        cursor,
        category,
      })

      let nextCursor: typeof cursor | undefined
      if (items.length > limit) {
        const nextItem = items.pop()
        nextCursor = nextItem!.id
      }

      logger.asset.info(`Found ${items.length} images`)

      return {
        items,
        nextCursor,
      }
    },
  ),

  fetchImagesByPage: publicProcedure.input(BasePageQuerySchema).query(
    async ({ ctx, input }) => {
      const { page, pageSize, category } = input
      logger.asset.info('Fetching images by page', { page, pageSize, category })
      const result = await assetService.findImagesByPage({
        userIds: ctx.groupUserIds,
        page,
        pageSize,
        category,
      })
      logger.asset.info(`Found ${result.items.length} images`, { total: result.total })
      return result
    },
  ),

  fetchVideosByCursor: publicProcedure.input(BaseQuerySchema).query(
    async ({ ctx, input }) => {
      const { limit, cursor, category } = input
      logger.asset.info('Fetching videos by cursor', { cursor, limit, category })
      const items = await assetService.findVideosByCursor({
        userIds: ctx.groupUserIds,
        take: limit + 1,
        cursor,
        category,
      })

      let nextCursor: typeof cursor | undefined
      if (items.length > limit) {
        const nextItem = items.pop()
        nextCursor = nextItem!.id
      }

      logger.asset.info(`Found ${items.length} videos`)

      return {
        items,
        nextCursor,
      }
    },
  ),

  getImageById: publicProcedure.input(BasePrimaryKeySchema).query(
    async ({ ctx, input }) => {
      const userIds = ctx.groupUserIds
      logger.asset.info('Fetching image by ID', { id: input.id })
      const result = await assetService.getImageById(input.id, userIds)
      return result
    },
  ),

  deleteImage: protectedProcedure.input(BasePrimaryKeySchema).mutation(
    async ({ ctx, input }) => {
      logger.asset.info('Deleting image', { id: input.id, userId: ctx.user.id })
      const result = await assetService.deleteImage(input.id, ctx.user.id)
      logger.asset.info('Image deleted successfully', { id: input.id })
      return result
    },
  ),

  deleteVideo: protectedProcedure.input(BasePrimaryKeySchema).mutation(
    async ({ ctx, input }) => {
      logger.asset.info('Deleting video', { id: input.id, userId: ctx.user.id })
      const result = await assetService.deleteVideo(input.id, ctx.user.id)
      logger.asset.info('Video deleted successfully', { id: input.id })
      return result
    },
  ),

  getImageCategories: publicProcedure.query(
    async ({ ctx }) => {
      logger.asset.info('Fetching image categories')
      const result = await assetService.getImageCategories(ctx.groupUserIds)
      logger.asset.info(`Found ${result.length} categories`)
      return result
    },
  ),
})
