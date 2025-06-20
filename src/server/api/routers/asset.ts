import type { RouterOutputs } from '@/trpc/react'
import { zfd } from 'zod-form-data'
import { BasePrimaryKeySchema, BaseQuerySchema } from '@/dto/base.dto'
import { PerformanceMonitor } from '@/lib/monitoring'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc'
import { assetService } from '@/service/asset.service'
import { uploadVideo } from '@/service/file.service'

export type Image = RouterOutputs['asset']['fetchImagesByCursor']['items'][number]
export type Video = RouterOutputs['asset']['fetchVideosByCursor']['items'][number]

export const assetRouter = createTRPCRouter({
  uploadImage: protectedProcedure
    .input(zfd.formData({
      file: zfd.file(),
      isPublic: zfd.text().default('false'),
      category: zfd.text().default('default'),
    }))
    .mutation(async ({ input, ctx }) => {
      return PerformanceMonitor.measureAsync('asset.uploadImage', async () => {
        const isPublic = input.isPublic === 'true'
        return assetService.uploadImage({
          file: input.file,
          uploadedBy: ctx.user.id,
          isPublic,
          category: input.category,
        })
      })
    }),

  uploadVideo: protectedProcedure
    .input(zfd.formData({
      file: zfd.file(),
      isPublic: zfd.text().default('false'),
      category: zfd.text().default('default'),
    }))
    .mutation(async ({ input, ctx }) => {
      return PerformanceMonitor.measureAsync('asset.uploadVideo', async () => {
        const isPublic = input.isPublic === 'true'
        return uploadVideo({
          file: input.file,
          uploadedBy: ctx.user.id,
          isPublic,
          category: input.category,
        })
      })
    }),

  fetchImagesByCursor: publicProcedure.input(BaseQuerySchema).query(
    async ({ ctx, input }) => {
      return PerformanceMonitor.measureAsync('asset.fetchImagesByCursor', async () => {
        const { limit, cursor, category } = input
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

        return {
          items,
          nextCursor,
        }
      })
    },
  ),

  fetchVideosByCursor: publicProcedure.input(BaseQuerySchema).query(
    async ({ ctx, input }) => {
      return PerformanceMonitor.measureAsync('asset.fetchVideosByCursor', async () => {
        const { limit, cursor, category } = input
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

        return {
          items,
          nextCursor,
        }
      })
    },
  ),

  getImageById: publicProcedure.input(BasePrimaryKeySchema).query(
    async ({ ctx, input }) => {
      return PerformanceMonitor.measureAsync('asset.getImageById', async () => {
        const userIds = ctx.groupUserIds
        return assetService.getImageById(input.id, userIds)
      })
    },
  ),

  deleteImage: protectedProcedure.input(BasePrimaryKeySchema).mutation(
    async ({ ctx, input }) => {
      return PerformanceMonitor.measureAsync('asset.deleteImage', async () => {
        return assetService.deleteImage(input.id, ctx.user.id)
      })
    },
  ),

  deleteVideo: protectedProcedure.input(BasePrimaryKeySchema).mutation(
    async ({ ctx, input }) => {
      return PerformanceMonitor.measureAsync('asset.deleteVideo', async () => {
        return assetService.deleteVideo(input.id, ctx.user.id)
      })
    },
  ),
})
