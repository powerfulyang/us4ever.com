import type { User } from '@/store/user'
import { Hono } from 'hono'
import { requestId } from 'hono/request-id'
import { internalRouter } from '@/server/hono/routes/internal'
import { lpRouter } from '@/server/hono/routes/lp'
import { telegramRouter } from '@/server/hono/routes/telegram'
import { ttsRouter } from '@/server/hono/routes/tts'
import { logger } from '@/server/logger'

export interface AppEnv {
  Variables: {
    user: User
    requestId: string
  }
}

export const app = new Hono().basePath('/api')

// Request ID 中间件 - 使用 Hono 官方中间件生成唯一追踪 ID
app.use(requestId({
  headerName: 'X-Request-Id',
  limitLength: 255,
}))

logger.hono.startup('Loading Hono routers...')

// 挂载各路由模块
app.route('/lp', lpRouter) // /api/lp
app.route('/tts', ttsRouter) // /api/tts
app.route('/sync', telegramRouter) // /api/sync/telegram/:channel_name (需认证)
app.route('/internal', internalRouter) // /api/internal/sync/telegram/:channel_name (内部调用)

logger.hono.startup('Hono routers loaded successfully ✅')
