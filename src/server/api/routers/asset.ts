import { Buffer } from 'node:buffer'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc'
import { getFileUrl, upload_image } from '@/service/file.service'

import { zfd } from 'zod-form-data'

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
  list_image: publicProcedure
    .query(async ({ ctx }) => {
      const images = await ctx.db.image.findMany({
        include: {
          original: {
            include: {
              bucket: true,
            },
          },
          compressed: {
            include: {
              bucket: true,
            },
          },
          thumbnail_320x: {
            include: {
              bucket: true,
            },
          },
          thumbnail_768x: {
            include: {
              bucket: true,
            },
          },
        },
        where: {
          OR: [
            {
              uploadedBy: ctx.user?.id,
            },
            {
              isPublic: true,
            },
          ],
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return images.map((image) => {
        const base64_1x1 = Buffer.from(image.thumbnail_10x).toString('base64')
        return {
          id: image.id,
          hash: image.hash,
          name: image.name,
          exif: image.exif,
          original_url: getFileUrl(image.original),
          original_size: image.original.size,
          compressed_url: getFileUrl(image.compressed),
          compressed_size: image.compressed.size,
          thumbnail_320x_url: getFileUrl(image.thumbnail_320x),
          thumbnail_320x_size: image.thumbnail_320x.size,
          thumbnail_768x_url: getFileUrl(image.thumbnail_768x),
          thumbnail_768x_size: image.thumbnail_768x.size,
          thumbnail_10x_url: `data:image/avif;base64,${base64_1x1}`,
          thumbnail_10x_size: image.thumbnail_10x.byteLength,
          address: image.address,
        }
      })
    }),
})
