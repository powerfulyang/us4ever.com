import type { RouterOutputs } from '@/trpc/react'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc'
import { getImageById, listAccessibleImages, listAccessibleVideos } from '@/service/asset.service'
import { upload_image, upload_video } from '@/service/file.service'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

export type Image = RouterOutputs['asset']['list_image'][number]

export const assetRouter = createTRPCRouter({
  upload_image: protectedProcedure
    .input(zfd.formData({
      file: zfd.file(),
      isPublic: zfd.text().default('false'),
    }))
    .mutation(async ({ input, ctx }) => {
      const isPublic = input.isPublic === 'true'
      return upload_image({
        file: input.file,
        uploadedBy: ctx.user.id,
        isPublic,
      })
    }),

  upload_video: protectedProcedure
    .input(zfd.formData({
      file: zfd.file(),
      isPublic: zfd.text().default('false'),
    }))
    .mutation(async ({ input, ctx }) => {
      const isPublic = input.isPublic === 'true'
      return upload_video({
        file: input.file,
        uploadedBy: ctx.user.id,
        isPublic,
      })
    }),

  list_image: publicProcedure
    .query(async ({ ctx }) => {
      return listAccessibleImages(ctx.groupUserIds)
    }),

  list_video: publicProcedure
    .query(async ({ ctx }) => {
      return listAccessibleVideos(ctx.groupUserIds)
    }),

  get_image_by_id: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return getImageById(input.id, ctx.user?.id)
    }),
})
