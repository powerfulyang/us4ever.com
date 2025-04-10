import { db } from '@/server/db'
import { internalRoutes } from '@/server/hono'
import { handleSyncTelegram } from '@/server/hono/routes/telegram'

export function loadInternalRouter() {
  internalRoutes.get('/sync/telegram/:channel_name', async (ctx) => {
    const channel_name = ctx.req.param('channel_name')
    const category = `telegram:${channel_name}`
    const force = ctx.req.query('force') !== undefined
    // find first admin user
    const admin = await db.user.findFirstOrThrow({
      where: {
        isAdmin: true,
      },
    })
    const allItems = await handleSyncTelegram(category, force, channel_name, admin.id)

    return ctx.json({ success: true, count: allItems.length })
  })
}
