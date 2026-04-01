/**
 * Keep 查询条件构建器
 */
import type { Prisma } from '@prisma/client'

/**
 * 构建 Keep 的查询 where 条件
 */
export function buildKeepWhereClause({
  userIds,
  category,
  visibility = 'all',
}: {
  userIds: string[]
  category?: string
  visibility?: 'all' | 'public' | 'private'
}): Prisma.KeepWhereInput {
  const baseCondition: Prisma.KeepWhereInput = {
    category,
  }

  // 处理 visibility 筛选
  if (visibility === 'public') {
    return {
      ...baseCondition,
      isPublic: true,
    }
  }
  if (visibility === 'private') {
    return {
      ...baseCondition,
      isPublic: false,
      ownerId: { in: userIds },
    }
  }
  // visibility === 'all' 时，使用权限逻辑
  return {
    ...baseCondition,
    OR: [
      { ownerId: { in: userIds } },
      { isPublic: true },
    ],
  }
}
