/**
 * Server Logger - 基于 Pino 的服务端日志系统
 * 提供高性能、结构化的日志输出，支持彩色格式化和敏感数据脱敏
 */
import type { AppEnv } from '@/server/hono'
import { AsyncLocalStorage } from 'node:async_hooks'
import { tryGetContext } from 'hono/context-storage'
import pino from 'pino'
import pretty from 'pino-pretty'
import { env } from '@/env'
import { redactSensitiveData } from '@/utils/redact'

// 创建 AsyncLocalStorage 用于在 tRPC 上下文中存储 requestId
const requestIdStorage = new AsyncLocalStorage<string>()

/**
 * 设置当前异步上下文的 requestId（用于 tRPC）
 * @param requestId - 请求 ID
 * @param callback - 回调函数
 */
export function runWithRequestId<T>(requestId: string | undefined, callback: () => T): T {
  return requestIdStorage.run(requestId ?? '', callback)
}

/**
 * 获取当前异步上下文的 requestId
 */
export function getCurrentRequestId(): string | undefined {
  const id = requestIdStorage.getStore()
  return id || undefined
}

// 创建 pretty 格式化流
const stream = pretty({
  colorize: true,
  translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
  ignore: 'pid,hostname',
  messageFormat: '{msg}',
  hideObject: true,
})

// 创建底层 pino logger 实例
const pinoLogger = pino(
  {
    level: env.LOG_LEVEL || 'info',
  },
  stream,
)

/**
 * 格式化值用于日志显示
 * - 字符串直接显示
 * - 对象/数组格式化为 JSON（带缩进）
 * - Error 显示 message + stack
 */
function formatValue(value: unknown): string {
  if (value === null)
    return 'null'
  if (value === undefined)
    return 'undefined'

  if (value instanceof Error) {
    return value.stack || value.message
  }

  const redacted = redactSensitiveData(value)

  if (typeof redacted === 'string') {
    return redacted
  }

  if (typeof redacted === 'object' && redacted !== null) {
    // 处理包含 stack 属性的普通对象（可能是转换过来的错误对象）
    const obj = redacted as Record<string, unknown>
    if (typeof obj.stack === 'string') {
      return obj.stack
    }

    try {
      return JSON.stringify(redacted, null, 2)
    }
    catch {
      return String(redacted)
    }
  }

  return String(redacted)
}

/**
 * 构建日志消息
 * 支持两种调用方式:
 * 1. logger.info('message')
 * 2. logger.info('message', data)
 * 3. logger.info('message', data1, data2, ...)
 */
function buildMessage(message: string, data?: unknown[]): string {
  let prefix = ''

  // 尝试获取 requestId（优先从 Hono 上下文，其次从 AsyncLocalStorage）
  let requestId: string | undefined
  try {
    const context = tryGetContext<AppEnv>()
    requestId = context?.var?.requestId
  }
  catch {
    // 忽略上下文获取错误
  }

  // 如果 Hono 上下文没有，尝试从 AsyncLocalStorage 获取（tRPC 使用）
  if (!requestId) {
    requestId = getCurrentRequestId()
  }

  if (requestId) {
    prefix += `[${requestId}]`
  }

  if (!data || data.length === 0) {
    return prefix + message
  }

  const parts = [prefix + message]

  for (const item of data) {
    const isErrorLike = item instanceof Error || (typeof item === 'object' && item !== null && typeof (item as any).stack === 'string')

    if (isErrorLike) {
      // 错误单独一行，显示完整栈
      parts.push(`\n❌ Error: ${formatValue(item)}`)
    }
    else if (typeof item === 'object' && item !== null) {
      // 对象格式化为 JSON
      parts.push(`\n${formatValue(item)}`)
    }
    else if (item) {
      // 简单值直接追加
      parts.push(` ${formatValue(item)}`)
    }
  }

  return parts.join('')
}

/**
 * 创建带服务标签的日志记录器
 * @param service - 服务名称
 * @returns 带标签的日志方法
 */
function createServiceLogger(service: string) {
  const prefix = `[${service}]`

  return {
    trace(message: string, ...data: unknown[]) {
      pinoLogger.trace(buildMessage(`${prefix} ${message}`, data))
    },

    debug(message: string, ...data: unknown[]) {
      pinoLogger.debug(buildMessage(`${prefix} ${message}`, data))
    },

    info(message: string, ...data: unknown[]) {
      pinoLogger.info(buildMessage(`${prefix} ${message}`, data))
    },

    warn(message: string, ...data: unknown[]) {
      pinoLogger.warn(buildMessage(`${prefix} ${message}`, data))
    },

    error(message: string, ...data: unknown[]) {
      pinoLogger.error(buildMessage(`${prefix} ${message}`, data))
    },

    fatal(message: string, ...data: unknown[]) {
      pinoLogger.fatal(buildMessage(`${prefix} ${message}`, data))
    },

    // 便捷方法：记录 API 调用
    apiCall(method: string, path: string, meta?: Record<string, unknown>) {
      const arrow = method === 'GET' ? '⬇️' : method === 'POST' ? '⬆️' : '🔄'
      this.info(`${arrow} ${method} ${path}`, meta)
    },

    // 便捷方法：记录 API 响应
    apiResponse(method: string, path: string, duration: number, status?: number) {
      const icon = status && status >= 400 ? '❌' : '✅'
      this.info(`${icon} ${method} ${path} - ${duration}ms`)
    },

    // 便捷方法：记录服务启动
    startup(message: string) {
      this.info(`🚀 ${message}`)
    },

    // 便捷方法：记录配置
    config(key: string, value: unknown) {
      this.debug(`⚙️ ${key}:`, value)
    },

    // 便捷方法：记录性能指标
    perf(label: string, duration: number) {
      const color = duration > 1000 ? '🔴' : duration > 500 ? '🟡' : '🟢'
      this.info(`${color} ${label}: ${duration.toFixed(2)}ms`)
    },
  }
}

/**
 * 服务端日志工具
 *
 * 使用方式:
 * - logger.info('简单消息')
 * - logger.info('带数据', { key: 'value' })
 * - logger.error('发生错误', error)
 * - logger.trpc.info('tRPC 消息')
 * - logger.db.info('数据库消息')
 */
export const logger = {
  // 基础日志方法
  trace(message: string, ...data: unknown[]) {
    pinoLogger.trace(buildMessage(message, data))
  },

  debug(message: string, ...data: unknown[]) {
    pinoLogger.debug(buildMessage(message, data))
  },

  info(message: string, ...data: unknown[]) {
    pinoLogger.info(buildMessage(message, data))
  },

  warn(message: string, ...data: unknown[]) {
    pinoLogger.warn(buildMessage(message, data))
  },

  error(message: string, ...data: unknown[]) {
    pinoLogger.error(buildMessage(message, data))
  },

  fatal(message: string, ...data: unknown[]) {
    pinoLogger.fatal(buildMessage(message, data))
  },

  // 各服务模块的日志记录器
  trpc: createServiceLogger('tRPC'),
  db: createServiceLogger('DB'),
  keep: createServiceLogger('Keep'),
  todo: createServiceLogger('Todo'),
  user: createServiceLogger('User'),
  mindmap: createServiceLogger('MindMap'),
  moment: createServiceLogger('Moment'),
  asset: createServiceLogger('Asset'),
  hono: createServiceLogger('Hono'),
  telegram: createServiceLogger('Telegram'),
  tts: createServiceLogger('TTS'),
  lp: createServiceLogger('LP'),
  internal: createServiceLogger('Internal'),
  server: createServiceLogger('Server'),

  // 保留原始 pino 实例以便需要时使用
  pino: pinoLogger,
}

// 默认导出 logger
export default logger
