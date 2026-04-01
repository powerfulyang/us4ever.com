import type { AppEnv } from '@/server/hono'
import { Hono } from 'hono'
import { auth } from '@/server/hono/middleware/auth'
import { logger } from '@/server/logger'
import { keepService } from '@/service/keep'
import { momentService } from '@/service/moment'
import { updateAllKeepsTags, updateAllMomentsTags } from '@/service/tag.service'

/**
 * Admin router - 需要管理员权限
 * auth 中间件已包含 isAdmin 检查
 */
export const adminRouter = new Hono<AppEnv>()
  .use(auth)
  .get('/tags/batch', async (ctx) => {
    const user = ctx.get('user')
    logger.admin.info('Batch tag generation request', { userId: user.id })

    const momentCount = await updateAllMomentsTags()
    const keepCount = await updateAllKeepsTags()

    logger.admin.info('Batch tag generation completed', { momentCount, keepCount, userId: user.id })
    return ctx.json({ success: true, momentCount, keepCount })
  })
  .get('/backfill/keep', async (ctx) => {
    const user = ctx.get('user')
    logger.admin.info('Keep vector backfill request', { userId: user.id })

    const result = await keepService.backfillVectors()

    logger.admin.info('Keep vector backfill completed', { processed: result.processed, userId: user.id })
    return ctx.json(result)
  })
  .get('/backfill/moment', async (ctx) => {
    const user = ctx.get('user')
    logger.admin.info('Moment vector backfill request', { userId: user.id })

    const result = await momentService.backfillVectors()

    logger.admin.info('Moment vector backfill completed', { processed: result.processed, userId: user.id })
    return ctx.json(result)
  })

logger.admin.startup('Admin router loaded')
