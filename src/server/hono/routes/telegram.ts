import { syncTelegram } from '@/lib/sync.telegram'
import { db } from '@/server/db'
import { app, auth } from '@/server/hono'
import { createKeep } from '@/service/keep.service'

export async function loadSyncTelegramRouter() {
  app.use(auth).get('/sync/telegram/emt_channel', async (ctx) => {
    const user = ctx.get('user')
    const posts = await syncTelegram()

    for (const item of posts) {
      const result = await db.keep.findFirst({
        where: {
          category: 'telegram:emt_channel',
          tags: {
            path: ['0', 'id'],
            equals: item.id,
          },
        },
      })
      if (!result) {
        const content = item.content || ''
        await createKeep({
          content,
          isPublic: true,
          ownerId: user.id,
          category: 'powerfulyang',
          tags: [
            {
              id: item.id,
            },
          ],
        })
      }
    }
    return ctx.json({ success: true })
  })
}
