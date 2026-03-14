/**
 * 统一错误处理系统
 * 提供类型安全的错误处理和用户友好的错误信息
 */

import { TRPCError } from '@trpc/server'
import { ZodError } from 'zod'

// 错误类型枚举
export enum ErrorCode {
  // 认证相关
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // 业务逻辑相关
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  INVALID_OPERATION = 'INVALID_OPERATION',

  // 数据相关
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',

  // 外部服务相关
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  UPLOAD_ERROR = 'UPLOAD_ERROR',

  // 系统相关
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

// 错误信息映射
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.UNAUTHORIZED]: '请先登录',
  [ErrorCode.FORBIDDEN]: '权限不足',
  [ErrorCode.TOKEN_EXPIRED]: '登录已过期，请重新登录',
  [ErrorCode.RESOURCE_NOT_FOUND]: '资源不存在',
  [ErrorCode.RESOURCE_ALREADY_EXISTS]: '资源已存在',
  [ErrorCode.INVALID_OPERATION]: '操作无效',
  [ErrorCode.VALIDATION_ERROR]: '数据验证失败',
  [ErrorCode.DATABASE_ERROR]: '数据库操作失败',
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: '外部服务异常',
  [ErrorCode.UPLOAD_ERROR]: '文件上传失败',
  [ErrorCode.INTERNAL_SERVER_ERROR]: '服务器内部错误',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: '请求过于频繁，请稍后再试',
}

// 自定义应用错误类
export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly context?: Record<string, any>

  constructor(
    code: ErrorCode,
    message?: string,
    statusCode = 500,
    context?: Record<string, any>,
  ) {
    super(message || ERROR_MESSAGES[code])
    this.code = code
    this.statusCode = statusCode
    this.isOperational = true
    this.context = context

    // 保持正确的堆栈跟踪
    Error.captureStackTrace(this, AppError)
  }
}

// 错误工厂函数
export const createError = {
  unauthorized: (message?: string, context?: Record<string, any>) =>
    new AppError(ErrorCode.UNAUTHORIZED, message, 401, context),

  forbidden: (message?: string, context?: Record<string, any>) =>
    new AppError(ErrorCode.FORBIDDEN, message, 403, context),

  notFound: (resource: string, context?: Record<string, any>) =>
    new AppError(ErrorCode.RESOURCE_NOT_FOUND, `${resource}不存在`, 404, context),

  alreadyExists: (resource: string, context?: Record<string, any>) =>
    new AppError(ErrorCode.RESOURCE_ALREADY_EXISTS, `${resource}已存在`, 409, context),

  validation: (message?: string, context?: Record<string, any>) =>
    new AppError(ErrorCode.VALIDATION_ERROR, message, 400, context),

  database: (message?: string, context?: Record<string, any>) =>
    new AppError(ErrorCode.DATABASE_ERROR, message, 500, context),

  upload: (message?: string, context?: Record<string, any>) =>
    new AppError(ErrorCode.UPLOAD_ERROR, message, 400, context),

  rateLimit: (message?: string, context?: Record<string, any>) =>
    new AppError(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429, context),
}

// 错误转换器 - 将各种错误转换为统一的 AppError
export function transformError(error: unknown): AppError {
  // 如果已经是 AppError，直接返回
  if (error instanceof AppError) {
    return error
  }

  // Zod 验证错误
  if (error instanceof ZodError) {
    const message = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    return createError.validation(message, { zodErrors: error.issues })
  }

  // Prisma 错误
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any
    switch (prismaError.code) {
      case 'P2002':
        return createError.alreadyExists('记录', { constraint: prismaError.meta?.target })
      case 'P2025':
        return createError.notFound('记录')
      default:
        return createError.database(`数据库错误: ${prismaError.message}`)
    }
  }

  // 标准 Error
  if (error instanceof Error) {
    return new AppError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      error.message,
      500,
      { originalError: error.name },
    )
  }

  // 未知错误
  return new AppError(
    ErrorCode.INTERNAL_SERVER_ERROR,
    '未知错误',
    500,
    { originalError: String(error) },
  )
}

// tRPC 错误转换器
export function toTRPCError(error: AppError): TRPCError {
  const codeMap: Record<number, 'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'TOO_MANY_REQUESTS' | 'INTERNAL_SERVER_ERROR'> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    429: 'TOO_MANY_REQUESTS',
    500: 'INTERNAL_SERVER_ERROR',
  }

  return new TRPCError({
    code: codeMap[error.statusCode] || 'INTERNAL_SERVER_ERROR',
    message: error.message,
    cause: error,
  })
}

// 错误日志记录器
export function logError(error: AppError, context?: Record<string, any>) {
  const logData = {
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack,
    context: { ...error.context, ...context },
    timestamp: new Date().toISOString(),
  }

  // 根据错误级别选择日志方法
  if (error.statusCode >= 500) {
    console.error('🚨 Server Error:', logData)
  }
  else if (error.statusCode >= 400) {
    console.warn('⚠️ Client Error:', logData)
  }
  else {
    console.info('ℹ️ Info:', logData)
  }
}

// 安全错误处理器 - 避免敏感信息泄露
export function sanitizeError(error: AppError, isProduction = false): {
  code: ErrorCode
  message: string
  statusCode: number
} {
  if (isProduction && error.statusCode >= 500) {
    return {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: ERROR_MESSAGES[ErrorCode.INTERNAL_SERVER_ERROR],
      statusCode: 500,
    }
  }

  return {
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
  }
}

// 重试机制
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    }
    catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt === maxRetries) {
        throw transformError(lastError)
      }

      // 指数退避
      await new Promise(resolve => setTimeout(resolve, delay * 2 ** (attempt - 1)))
    }
  }

  throw transformError(lastError!)
}

// 断路器模式
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  constructor(
    private readonly threshold = 5,
    private readonly timeout = 60000, // 1分钟
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN'
      }
      else {
        throw createError.rateLimit('服务暂时不可用')
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    }
    catch (error) {
      this.onFailure()
      throw transformError(error)
    }
  }

  private onSuccess() {
    this.failures = 0
    this.state = 'CLOSED'
  }

  private onFailure() {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.failures >= this.threshold) {
      this.state = 'OPEN'
    }
  }
}
