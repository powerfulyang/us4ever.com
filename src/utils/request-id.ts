/**
 * Request ID 生成工具
 * 用于在 Hono 和 tRPC 中统一生成请求追踪 ID
 */

/**
 * 生成短格式的唯一请求 ID
 * 格式: 时间戳(36进制) + 随机数(36进制) - 约 10-12 字符
 */
export function generateRequestId(): string {
  return globalThis.crypto.randomUUID()
}

/**
 * 从请求头中获取 requestId，如果没有则生成新的
 */
export function getOrGenerateRequestId(headers?: Headers): string {
  // 尝试从请求头中获取（可用于链路追踪）
  const headerRequestId = headers?.get('x-request-id')
  if (headerRequestId) {
    return headerRequestId
  }
  return generateRequestId()
}
