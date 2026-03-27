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
