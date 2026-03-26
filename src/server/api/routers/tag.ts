import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { logger } from '@/server/logger'
import { getAllTags, getContentByTag } from '@/service/tag.service'

export const tagRouter = createTRPCRouter({
  // 获取所有标签及其统计
  getAll: publicProcedure
    .input(z.object({
      filter: z.enum(['all', 'public', 'private']).default('all'),
    }).optional())
    .query(async ({ input, ctx }) => {
      const userIds = ctx.groupUserIds
      const filter = input?.filter ?? 'all'
      logger.internal.info('Fetching all tags', { filter })
      const result = await getAllTags({ filter, userIds })
      logger.internal.info(`Found ${result.length} unique tags`)
      return result
    }),

  // 根据标签获取内容（Keep 和 Moment）
  getContentByTag: publicProcedure
    .input(z.object({
      tag: z.string(),
      filter: z.enum(['all', 'public', 'private']).default('all'),
      limit: z.number().int().min(1).max(100).default(50),
    }))
    .query(async ({ input, ctx }) => {
      const userIds = ctx.groupUserIds
      const { tag, filter, limit } = input
      logger.internal.info('Fetching content by tag', { tag, filter })
      const result = await getContentByTag(tag, { filter, userIds, limit })
      logger.internal.info(`Found ${result.total} items by tag`, { tag })
      return result
    }),
})
