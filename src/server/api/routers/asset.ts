import type { RouterOutputs } from '@/trpc/react'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc'
import { getImageById, listImages, listVideos } from '@/service/asset.service'
import { upload_image, upload_video } from '@/service/file.service'

export type Image = RouterOutputs['asset']['infinite_image_list']['items'][number]

export const assetRouter = createTRPCRouter({
  upload_image: protectedProcedure
    .input(zfd.formData({
      file: zfd.file(),
      isPublic: zfd.text().default('false'),
      category: zfd.text().default('default'),
    }))
    .mutation(async ({ input, ctx }) => {
      const isPublic = input.isPublic === 'true'
      return upload_image({
        file: input.file,
        uploadedBy: ctx.user.id,
        isPublic,
        category: input.category,
      })
    }),

  upload_video: protectedProcedure
    .input(zfd.formData({
      file: zfd.file(),
      isPublic: zfd.text().default('false'),
      category: zfd.text(),
    }))
    .mutation(async ({ input, ctx }) => {
      const isPublic = input.isPublic === 'true'
      return upload_video({
        file: input.file,
        uploadedBy: ctx.user.id,
        isPublic,
        category: input.category,
      })
    }),

  infinite_image_list: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(6),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input
      const items = await listImages({
        userIds: ctx.groupUserIds,
        take: limit + 1,
        cursor,
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
    }),

  infinite_video_list: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(6),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input
      const items = await listVideos({
        userIds: ctx.groupUserIds,
        take: limit + 1,
        cursor,
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
    }),

  getImageById: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const userIds = ctx.groupUserIds
      return getImageById(input.id, userIds)
    }),
})
