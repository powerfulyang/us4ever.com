import dayjs from 'dayjs'

export function formatFileSize(size: number | bigint): string {
  const sizeNum = BigInt(size)

  if (sizeNum < 1024n) {
    return `${sizeNum} B`
  }
  if (sizeNum < 1024n * 1024n) {
    return `${Number(sizeNum * 100n / 1024n) / 100} KB`
  }

  if (sizeNum < 1024n * 1024n * 1024n) {
    return `${Number(sizeNum * 100n / (1024n * 1024n)) / 100} MB`
  }

  return `${Number(sizeNum * 100n / (1024n * 1024n * 1024n)) / 100} GB`
}

/**
 * 工具函数统一导出
 * 提供类型安全的工具函数集合
 */

// 样式工具
export * from './cn'

// format: [116, 59, 60] => 116°59′60″
// 转成小数的形式
export function formatBearing(bearing: [number, number, number]): number {
  return bearing[0] + bearing[1] / 60 + bearing[2] / 3600
}

/**
 * 将数字格式化为千分位形式
 * @param num 要格式化的数字
 * @param decimals 保留的小数位数，默认为 2
 * @returns 格式化后的字符串
 * @example
 * formatThousands(1234567.89) // => "1,234,567.89"
 * formatThousands(1234.5, 1) // => "1,234.5"
 * formatThousands(1234) // => "1,234.00"
 */
export function formatThousands(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export function formatDateTime(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 将日期格式化为相对时间（如"3天前"、"1小时前"）
 * @param date 日期字符串或 Date 对象
 * @returns 相对时间字符串
 * @example
 * formatDistanceToNow('2024-01-01') // => "3个月前"
 * formatDistanceToNow(new Date(Date.now() - 3600000)) // => "1小时前"
 */
export function formatDistanceToNow(date: string | Date): string {
  const now = dayjs()
  const target = dayjs(date)
  const diffMs = now.diff(target)

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) {
    return '刚刚'
  }
  if (minutes < 60) {
    return `${minutes}分钟前`
  }
  if (hours < 24) {
    return `${hours}小时前`
  }
  if (days < 30) {
    return `${days}天前`
  }
  if (months < 12) {
    return `${months}个月前`
  }
  return `${years}年前`
}
