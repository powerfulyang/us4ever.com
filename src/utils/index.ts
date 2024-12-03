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

export * from './cn'

// format: [116, 59, 60] => 116°59′60″
// 转成小数的形式
export function formatBearing(bearing: [number, number, number]): number {
  return bearing[0] + bearing[1] / 60 + bearing[2] / 3600
}
