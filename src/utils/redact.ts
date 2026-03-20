/**
 * 敏感数据脱敏工具
 * 用于在日志中隐藏敏感信息
 */

// 敏感字段列表
const SENSITIVE_FIELDS = new Set([
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'authorization',
  'cookie',
  'session',
  'privateKey',
  'private_key',
  'creditCard',
  'credit_card',
  'cvv',
  'ssn',
  'phone',
  'email',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'jwt',
  'database_url',
  'DATABASE_URL',
])

// 敏感值模式
const SENSITIVE_PATTERNS = [
  // JWT Token
  /^eyJ[\w-]*\.eyJ[\w-]*\.[\w-]*$/,
  // API Key (常见格式)
  /^[a-z0-9]{32,}$/i,
  // Bearer Token
  /^Bearer\s+[\w-]+$/,
  // 数据库 URL 中的密码
  /:\/\/[^:]+:([^@]+)@/,
]

/**
 * 检查是否为敏感字段
 */
function isSensitiveField(key: string): boolean {
  const lowerKey = key.toLowerCase()
  return SENSITIVE_FIELDS.has(key)
    || SENSITIVE_FIELDS.has(lowerKey)
    || lowerKey.includes('password')
    || lowerKey.includes('secret')
    || lowerKey.includes('token')
    || lowerKey.includes('key')
    || lowerKey.includes('auth')
}

/**
 * 脱敏字符串值
 */
function redactString(value: string): string {
  if (!value || value.length <= 4) {
    return '***'
  }

  // 检查是否匹配敏感模式
  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(value)) {
      return '***'
    }
  }

  // 部分脱敏：显示前2后2
  return `${value.slice(0, 2)}***${value.slice(-2)}`
}

/**
 * 递归脱敏对象中的敏感数据
 */
export function redactSensitiveData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data
  }

  // 处理 Error 对象
  if (data instanceof Error) {
    return data
  }

  // 处理 Date
  if (data instanceof Date) {
    return data
  }

  // 处理数组
  if (Array.isArray(data)) {
    return data.map(item => redactSensitiveData(item)) as unknown as T
  }

  // 处理对象
  if (typeof data === 'object') {
    const result = {} as Record<string, unknown>
    for (const [key, value] of Object.entries(data)) {
      if (isSensitiveField(key)) {
        // 敏感字段脱敏
        if (typeof value === 'string') {
          result[key] = redactString(value)
        }
        else if (typeof value === 'object' && value !== null) {
          result[key] = '[REDACTED]'
        }
        else {
          result[key] = '***'
        }
      }
      else {
        result[key] = redactSensitiveData(value)
      }
    }
    return result as T
  }

  // 基本类型直接返回
  return data
}
