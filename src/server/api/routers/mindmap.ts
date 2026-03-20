import { z } from 'zod'
import { BasePageQuerySchema, BasePrimaryKeySchema, BaseQuerySchema, UpdateViewsSchema } from '@/dto/base.dto'
import { logger } from '@/server/logger'
import { mindMapService } from '@/service/mindmap.service'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const mindMapRouter = createTRPCRouter({
  fetchByCursor: publicProcedure.input(BaseQuerySchema).query(
    async ({ ctx, input }) => {
      const { limit, cursor } = input
      const userIds = ctx.groupUserIds
      logger.mindmap.info('Fetching mindmaps by cursor', { cursor, limit })
      const result = await mindMapService.findMindMapsByCursor({
        userIds,
        take: limit + 1,
        cursor,
      })
      logger.mindmap.info(`Found ${result.items.length} mindmaps`)
      return result
    },
  ),

  fetchByPage: publicProcedure.input(BasePageQuerySchema).query(
    async ({ ctx, input }) => {
      const { page, pageSize } = input
      const userIds = ctx.groupUserIds
      logger.mindmap.info('Fetching mindmaps by page', { page, pageSize })
      const result = await mindMapService.findMindMapsByPage({
        userIds,
        page,
        pageSize,
      })
      logger.mindmap.info(`Found ${result.items.length} mindmaps`, { total: result.total })
      return result
    },
  ),

  getById: publicProcedure
    .input(UpdateViewsSchema.merge(BasePrimaryKeySchema))
    .query(async ({ ctx, input }) => {
      const userIds = ctx.groupUserIds
      logger.mindmap.info('Fetching mindmap by ID', { id: input.id, updateViews: input.updateViews })
      const result = await mindMapService.findMindMapById(input.id, userIds, input.updateViews)
      return result
    }),

  createByXMind: protectedProcedure
    .input(z.object({
      title: z.string().optional(),
      content: z.record(z.string(), z.any()),
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      logger.mindmap.info('Creating new mindmap', { title: input.title, ownerId: ctx.user.id })
      const result = await mindMapService.createMindMap({
        ...input,
        ownerId: ctx.user.id,
      })
      logger.mindmap.info('Mindmap created successfully', { id: result.id })
      return result
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      isPublic: z.boolean(),
      title: z.string(),
      content: z.record(z.string(), z.any()),
    }))
    .mutation(async ({ ctx, input }) => {
      logger.mindmap.info('Updating mindmap', { id: input.id, title: input.title })
      const result = await mindMapService.updateMindMap({
        ...input,
        ownerId: ctx.user.id,
      })
      logger.mindmap.info('Mindmap updated successfully', { id: input.id })
      return result
    }),

  delete: protectedProcedure
    .input(BasePrimaryKeySchema)
    .mutation(async ({ ctx, input }) => {
      logger.mindmap.info('Deleting mindmap', { id: input.id, userId: ctx.user.id })
      const result = await mindMapService.deleteMindMap(input.id, ctx.user.id)
      logger.mindmap.info('Mindmap deleted successfully', { id: input.id })
      return result
    }),
})
