// 增强版监控模块 - 简化版本
export interface Span {
  end: () => void
  setStatus: (status: { code: number, message?: string }) => void
  setAttribute: (key: string, value: any) => void
  recordException: (error: Error) => void
}

// 简单的 Span 实现
class SimpleSpan implements Span {
  private startTime = performance.now()

  constructor(private name: string) {
    console.log(`[TRACE] Starting span: ${name}`)
  }

  end(): void {
    const duration = performance.now() - this.startTime
    console.log(`[TRACE] Ending span: ${this.name} (${duration.toFixed(2)}ms)`)
  }

  setStatus(status: { code: number, message?: string }): void {
    console.log(`[TRACE] Span ${this.name} status:`, status)
  }

  setAttribute(key: string, value: any): void {
    console.log(`[TRACE] Span ${this.name} attribute:`, { [key]: value })
  }

  recordException(error: Error): void {
    console.error(`[TRACE] Span ${this.name} exception:`, error)
  }
}

// Tracer 实现
export const tracer = {
  startSpan(name: string): Span {
    return new SimpleSpan(name)
  },
}

// 性能监控工具类
export class PerformanceMonitor {
  private static timers = new Map<string, number>()

  static startTimer(name: string): void {
    this.timers.set(name, performance.now())
  }

  static endTimer(name: string, attributes?: Record<string, any>): number {
    const startTime = this.timers.get(name)
    if (!startTime) {
      console.warn(`Timer ${name} was not started`)
      return 0
    }

    const duration = performance.now() - startTime
    this.timers.delete(name)

    console.log(`[METRIC] ${name} duration: ${duration.toFixed(2)}ms`, attributes)
    return duration
  }

  static async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    attributes?: Record<string, any>,
  ): Promise<T> {
    const span = tracer.startSpan(name)
    const startTime = performance.now()

    try {
      const result = await fn()
      span.setStatus({ code: 1 })
      return result
    }
    catch (error) {
      span.setStatus({
        code: 2,
        message: error instanceof Error ? error.message : 'Unknown error',
      })
      span.recordException(error as Error)
      throw error
    }
    finally {
      const duration = performance.now() - startTime
      span.setAttribute('duration_ms', duration)

      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          span.setAttribute(key, value)
        })
      }

      span.end()
    }
  }
}

// 指标记录
export function recordMetric(
  name: string,
  value: number,
  attributes?: Record<string, any>,
): void {
  console.log(`[METRIC] ${name}:`, value, attributes)
}

/**
 * 将字节转换为人类可读的格式
 * @param bytes 字节数
 * @param decimals 小数位数
 * @returns 格式化后的字符串
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0)
    return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(decimals))} ${sizes[i]}`
}

// 健康检查
export async function checkHealth() {
  const checks: Record<string, boolean> = {}

  try {
    const { db } = await import('@/server/db')
    await db.$queryRaw`SELECT 1`
    checks.database = true
  }
  catch {
    checks.database = false
  }

  // 检查内存使用
  const memUsage = process.memoryUsage()
  checks.memory = memUsage.heapUsed < memUsage.heapTotal * 0.9

  // 转换为人类可读格式
  const formattedMemUsage = {
    rss: formatBytes(memUsage.rss),
    heapTotal: formatBytes(memUsage.heapTotal),
    heapUsed: formatBytes(memUsage.heapUsed),
    external: formatBytes(memUsage.external),
    arrayBuffers: formatBytes(memUsage.arrayBuffers || 0),
    // 保留原始数据用于计算
    raw: memUsage,
  }

  const status = Object.values(checks).every(Boolean) ? 'healthy' : 'unhealthy'

  return {
    status,
    checks,
    timestamp: new Date().toISOString(),
    memUsage: formattedMemUsage,
  }
}
