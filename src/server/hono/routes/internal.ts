import { db } from '@/server/db'
import { internalRoutes } from '@/server/hono'
import { handleSyncTelegram } from '@/server/hono/routes/telegram'
import { logger } from '@/server/logger'

export function loadInternalRouter() {
  internalRoutes.get('/sync/telegram/:channel_name', async (ctx) => {
    const channel_name = ctx.req.param('channel_name')
    const category = `telegram:${channel_name}`
    const force = ctx.req.query('force') !== undefined

    logger.internal.info('Internal Telegram sync request', { channel: channel_name, category, force })

    // find first admin user
    const admin = await db.user.findFirstOrThrow({
      where: {
        isAdmin: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    logger.internal.info('Using admin user for sync', { adminId: admin.id })

    const allItems = await handleSyncTelegram(category, force, channel_name, admin.id)

    logger.internal.info('Internal sync completed', { count: allItems.length })

    return ctx.json({ success: true, count: allItems.length })
  })

  internalRoutes.get('/generate/tags/batch', async (ctx) => {
    const { updateAllMomentsTags, updateAllKeepsTags } = await import('@/service/tag.service')

    logger.internal.info('Internal batch tag generation request starting')

    const momentCount = await updateAllMomentsTags()
    const keepCount = await updateAllKeepsTags()

    logger.internal.info('Internal batch tag generation completed', { momentCount, keepCount })

    return ctx.json({ success: true, momentCount, keepCount })
  })

  logger.internal.startup('Internal router loaded')
}
