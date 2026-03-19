import { Prisma } from '@prisma/client'
import { db } from '@/server/db'
import { getEmbedding } from './embedding.service'

/**
 * 语义搜索 Keep
 * @param query 搜索关键词
 * @param userIds 可访问的用户 ID 列表
 * @param topK 返回结果数
 */
export async function semanticSearchKeeps(query: string, userIds: string[], topK = 10) {
  if (userIds.length === 0)
    return []

  try {
    const embedding = await getEmbedding(query)
    const vectorStr = `[${embedding.join(',')}]`

    // 使用 PostgreSQL 的 pgvector 进行搜索
    // 我们需要将 JSONB 转换为 vector 类型进行比较
    // text-embedding-004 的维度是 3072
    const results = await db.$queryRaw<any[]>(Prisma.sql`
      SELECT 
        id, title, content, summary, "isPublic", category,
        "createdAt", "updatedAt",
        (
          COALESCE(1 - (CAST(title_vector AS vector) <=> CAST(${vectorStr} AS vector)), 0) * 0.3 +
          COALESCE(1 - (CAST(content_vector AS vector) <=> CAST(${vectorStr} AS vector)), 0) * 0.3 +
          COALESCE(1 - (CAST(summary_vector AS vector) <=> CAST(${vectorStr} AS vector)), 0) * 0.4
        ) as similarity,
        ts_headline('simple', COALESCE(title, ''), websearch_to_tsquery('simple', ${query}), 'StartSel=<mark>, StopSel=</mark>') as highlight_title,
        ts_headline('simple', COALESCE(summary, ''), websearch_to_tsquery('simple', ${query}), 'StartSel=<mark>, StopSel=</mark>') as highlight_summary,
        ts_headline('simple', COALESCE(content, ''), websearch_to_tsquery('simple', ${query}), 'StartSel=<mark>, StopSel=</mark>') as highlight_content
      FROM keeps
      WHERE 
        (title_vector IS NOT NULL OR content_vector IS NOT NULL OR summary_vector IS NOT NULL) AND
        ("isPublic" = true OR "ownerId" IN (${Prisma.join(userIds)}))
      ORDER BY similarity DESC
      LIMIT ${topK}
    `)

    return results.map(r => ({
      id: r.id,
      title: r.title,
      content: r.content,
      summary: r.summary,
      category: r.category,
      isPublic: r.isPublic,
      similarity: Number(r.similarity),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      highlight_title: r.highlight_title || undefined,
      highlight_summary: r.highlight_summary || undefined,
      highlight_content: r.highlight_content || undefined,
    }))
  }
  catch (error) {
    console.error('[Vector Search] Failed:', error)
    return []
  }
}

/**
 * RRF (Reciprocal Rank Fusion) 融合排序
 * @param keywordResults 关键词搜索结果记录
 * @param semanticResults 语义搜索结果记录
 * @param k RRF 常数，默认为 60
 */
export function hybridRankFusion(
  keywordResults: { id: string, score: number, [key: string]: any }[],
  semanticResults: { id: string, similarity: number, [key: string]: any }[],
  k = 60,
) {
  const scores = new Map<string, number>()
  const originalData = new Map<string, any>()

  // 处理关键词结果
  keywordResults.forEach((res, index) => {
    const score = 1 / (k + index + 1)
    scores.set(res.id, (scores.get(res.id) || 0) + score)
    // 保存元数据以便返回
    if (!originalData.has(res.id)) {
      originalData.set(res.id, { ...res })
    }
  })

  // 处理语义结果
  semanticResults.forEach((res, index) => {
    const score = 1 / (k + index + 1)
    scores.set(res.id, (scores.get(res.id) || 0) + score)
    // 保存元数据以便返回，如果已存在则合并新技术（如 similarity）
    if (!originalData.has(res.id)) {
      originalData.set(res.id, { ...res })
    }
    else {
      originalData.set(res.id, { ...originalData.get(res.id), ...res })
    }
  })

  // 排序并返回
  return [...scores.entries()]
    .toSorted((a, b) => b[1] - a[1])
    .map(([id, score]) => {
      const data = originalData.get(id) || {}
      return {
        ...data,
        id,
        score,
        matchType: (keywordResults.some(r => r.id === id) && semanticResults.some(r => r.id === id))
          ? 'both'
          : keywordResults.some(r => r.id === id) ? 'keyword' : 'semantic',
      }
    })
}
