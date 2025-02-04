import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { createMoment, deleteMoment, listMoments, updateMoment } from '@/service/moment.service'
import { z } from 'zod'

export type Moment = Awaited<ReturnType<typeof listMoments>>[number]

export const momentRouter = createTRPCRouter({
  list: publicProcedure
    .query(async ({ ctx }) => {
      return listMoments({ userId: ctx.user?.id })
    }),

  create: protectedProcedure
    .input(z.object({
      content: z.string(),
      category: z.string().default('default'),
      imageIds: z.array(z.string()),
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      return createMoment({
        ...input,
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
