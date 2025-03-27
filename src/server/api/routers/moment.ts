import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { createMoment, deleteMoment, listMoments, updateMoment } from '@/service/moment.service'
import { z } from 'zod'

export type Moment = Awaited<ReturnType<typeof listMoments>>[number]

export const momentRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
      }).default({}),
    )
    .query(async ({ ctx, input }) => {
      return listMoments({
        userIds: ctx.groupUserIds,
        category: input.category,
      })
    }),

  create: protectedProcedure
    .input(z.object({
      content: z.string(),
      category: z.string().default('default'),
      imageIds: z.array(z.string()),
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const { imageIds, ...rest } = input
      const images = imageIds.map((id, index) => ({ id, sort: index }))
      return createMoment({
        ...rest,
        images,
        ownerId: ctx.user.id,
      })
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      content: z.string(),
      category: z.string(),
      imageIds: z.array(z.string()),
    }))
    .mutation(async ({ input, ctx }) => {
      return updateMoment({
        ...input,
        ownerId: ctx.user.id,
      })
    }),

  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      return deleteMoment(input.id, ctx.user.id)
    }),
})
