import * as Sentry from '@sentry/nextjs'

export async function register() {
  // Dev 环境不加载 Sentry 配置
  if (process.env.NODE_ENV === 'development') {
    return
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

export const onRequestError = Sentry.captureRequestError
