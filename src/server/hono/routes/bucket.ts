import { app, auth } from '@/server/hono'

export function loadBucketRouter() {
  app.use(auth).get('/sync/bucket/powerfulyang', async (ctx) => {
    return ctx.json({ success: true })
  })
}
