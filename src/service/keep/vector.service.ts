/**
 * Keep 向量操作服务
 * 处理向量生成、更新和回填
 */
import { Prisma } from '@prisma/client'
import { db } from '@/server/db'
import { generateKeepEmbeddings } from '../embedding.service'

/**
 * 为指定 Keep 生成并更新向量
 */
export async function updateKeepVectors(
  keepId: string,
  data: { title?: string, content: string, summary?: string },
) {
  try {
    const vectors = await generateKeepEmbeddings(data)

    // 由于 vector 是 Unsupported 类型，必须使用原生 SQL 更新
    const contentVector = `[${vectors.content_vector.join(',')}]`
    const titleVector = vectors.title_vector ? `[${vectors.title_vector.join(',')}]` : null
    const summaryVector = vectors.summary_vector ? `[${vectors.summary_vector.join(',')}]` : null

    await db.$executeRaw(Prisma.sql`
      UPDATE keeps
      SET
        title_vector = ${titleVector}::vector,
        content_vector = ${contentVector}::vector,
        summary_vector = ${summaryVector}::vector
      WHERE id = ${keepId}
    `)

    console.log(`[RAG] Vectors updated for Keep ${keepId}`)
  }
  catch (error) {
    // 向量生成失败不应影响主流程
    console.error(`[RAG] Failed to update vectors for Keep ${keepId}:`, error)
  }
}

/**
 * 批量回填向量（管理员使用）
 */
export async function backfillVectors(batchSize = 50) {
  // 由于 content_vector 是 Unsupported 类型，无法直接在 findMany 中使用 where
  // 使用 $queryRaw 先获取待处理的数据
  const pendingKeeps = await db.$queryRaw<any[]>(Prisma.sql`
    SELECT id, title, content, summary FROM keeps
    WHERE content_vector IS NULL
    LIMIT ${batchSize}
  `)

  if (pendingKeeps.length === 0) {
    return { processed: 0, remaining: 0 }
  }

  let processed = 0
  for (const keep of pendingKeeps) {
    try {
      await updateKeepVectors(keep.id, {
        title: keep.title,
        content: keep.content,
        summary: keep.summary,
      })
      processed++
    }
    catch (error) {
      console.error(`[RAG] Backfill failed for Keep ${keep.id}:`, error)
    }
  }

  // 查询剩余未处理数量
  const countResult = await db.$queryRaw<any[]>(Prisma.sql`
    SELECT count(*)::int as count FROM keeps WHERE content_vector IS NULL
  `)
  const remaining = countResult[0]?.count ?? 0

  return { processed, remaining }
}
