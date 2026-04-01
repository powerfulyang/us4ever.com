/**
 * Moment 向量操作服务
 * 处理向量生成、更新和回填
 */
import { Prisma } from '@prisma/client'
import { db } from '@/server/db'
import { getEmbedding } from '../embedding.service'

/**
 * 为指定 Moment 生成并更新向量
 * @param momentId Moment ID
 * @param content 动态内容
 */
export async function updateMomentVectors(momentId: string, content: string) {
  try {
    const vector = await getEmbedding(content)
    const vectorStr = `[${vector.join(',')}]`

    await db.$executeRaw(Prisma.sql`
      UPDATE moments
      SET content_vector = ${vectorStr}::vector
      WHERE id = ${momentId}
    `)

    console.log(`[RAG] Vector updated for Moment ${momentId}`)
  }
  catch (error) {
    console.error(`[RAG] Failed to update vector for Moment ${momentId}:`, error)
  }
}

/**
 * 批量回填向量
 */
export async function backfillVectors(batchSize = 50) {
  const pendingMoments = await db.$queryRaw<{ id: string, content: string }[]>(Prisma.sql`
    SELECT id, content FROM moments
    WHERE content_vector IS NULL
    LIMIT ${batchSize}
  `)

  if (pendingMoments.length === 0) {
    return { processed: 0, remaining: 0 }
  }

  let processed = 0
  for (const moment of pendingMoments) {
    try {
      await updateMomentVectors(moment.id, moment.content)
      processed++
    }
    catch (error) {
      console.error(`[RAG] Backfill failed for Moment ${moment.id}:`, error)
    }
  }

  const countResult = await db.$queryRaw<any[]>(Prisma.sql`
    SELECT count(*)::int as count FROM moments WHERE content_vector IS NULL
  `)
  const remaining = countResult[0]?.count ?? 0

  return { processed, remaining }
}
