/**
 * Moment 查询条件构建器
 */
import type { Prisma } from '@prisma/client'

/**
 * 构建 Moment 的查询 where 条件
 */
export function buildMomentWhereClause({
  userIds,
  category,
  visibility = 'all',
}: {
  userIds: string[]
  category?: string
  visibility?: 'all' | 'public' | 'private'
}): Prisma.MomentWhereInput {
  const baseCondition: Prisma.MomentWhereInput = {
    category,
  }

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
  return {
    ...baseCondition,
    OR: [
      { ownerId: { in: userIds } },
      { isPublic: true },
    ],
  }
}
