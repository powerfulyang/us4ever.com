import { z } from 'zod'
import { BasePrimaryKeySchema, BaseQuerySchema, UpdateViewsSchema } from '@/dto/base.dto'
import { PerformanceMonitor } from '@/lib/monitoring'
import { mindMapService } from '@/service/mindmap.service'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const mindMapRouter = createTRPCRouter({
  fetchByCursor: publicProcedure.input(BaseQuerySchema).query(
    async ({ ctx, input }) => {
      return PerformanceMonitor.measureAsync('mindMap.fetchByCursor', async () => {
        const { limit, cursor } = input
        const userIds = ctx.groupUserIds
        return mindMapService.findMindMapsByCursor({
          userIds,
          take: limit + 1,
          cursor,
        })
      })
    },
  ),

  getById: publicProcedure
    .input(UpdateViewsSchema.merge(BasePrimaryKeySchema))
    .query(async ({ ctx, input }) => {
      return PerformanceMonitor.measureAsync('mindMap.getById', async () => {
        const userIds = ctx.groupUserIds
        return mindMapService.findMindMapById(input.id, userIds, input.updateViews)
      })
    }),

  createByXMind: protectedProcedure
    .input(z.object({
      title: z.string().optional(),
      content: z.record(z.any()),
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      return PerformanceMonitor.measureAsync('mindMap.createByXMind', async () => {
        return mindMapService.createMindMap({
          ...input,
          ownerId: ctx.user.id,
        })
      })
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      isPublic: z.boolean(),
      title: z.string(),
      content: z.record(z.any()),
    }))
    .mutation(async ({ ctx, input }) => {
      return PerformanceMonitor.measureAsync('mindMap.update', async () => {
        return mindMapService.updateMindMap({
          ...input,
          ownerId: ctx.user.id,
        })
      })
    }),

  delete: protectedProcedure
    .input(BasePrimaryKeySchema)
    .mutation(async ({ ctx, input }) => {
      return PerformanceMonitor.measureAsync('mindMap.delete', async () => {
        return mindMapService.deleteMindMap(input.id, ctx.user.id)
      })
    }),
})
