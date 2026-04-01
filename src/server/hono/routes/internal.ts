import { Hono } from 'hono'
import { db } from '@/server/db'
import { handleSyncTelegram } from '@/server/hono/routes/telegram'
import { logger } from '@/server/logger'

/**
 * Internal router - 内部服务调用路由（无认证）
 * 自动使用第一个管理员用户执行操作
 */
export const internalRouter = new Hono()
  .get('/sync/telegram/:channel_name', async (ctx) => {
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

logger.internal.startup('Internal router loaded')
