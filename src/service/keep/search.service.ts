/**
 * Keep 搜索服务 - 关键词、语义、混合搜索
 */
import type { KeywordSearchHit } from './types'
import { Prisma } from '@prisma/client'
import { db } from '@/server/db'
import { hybridRankFusion, semanticSearchKeeps } from '../vector-search.service'

/**
 * 使用 Postgres 原生全文检索搜索笔记
 */
export async function searchKeeps(searchTerm: string, topK = 10): Promise<KeywordSearchHit[]> {
  const query = searchTerm.trim()
  if (!query)
    return []

  // 使用 PostgreSQL pg_trgm 进行相似度搜索
  const results = await db.$queryRaw<any[]>(Prisma.sql`
    SELECT
      id, title, content, summary, "isPublic", category,
      "createdAt", "updatedAt",
      (
        word_similarity(${query}::text, COALESCE(title, '')) * 1.5 +
        word_similarity(${query}::text, COALESCE(summary, '')) * 1.2 +
        word_similarity(${query}::text, COALESCE(content, '')) * 1.0
      ) as score,
      ts_headline('simple', COALESCE(title, ''), websearch_to_tsquery('simple', ${query}), 'StartSel=<mark>, StopSel=</mark>') as highlight_title,
      ts_headline('simple', COALESCE(summary, ''), websearch_to_tsquery('simple', ${query}), 'StartSel=<mark>, StopSel=</mark>') as highlight_summary,
      ts_headline('simple', COALESCE(content, ''), websearch_to_tsquery('simple', ${query}), 'StartSel=<mark>, StopSel=</mark>') as highlight_content
    FROM keeps
    WHERE
      (${query}::text <% (COALESCE(title, '') || ' ' || COALESCE(summary, '') || ' ' || COALESCE(content, '')))
      OR (COALESCE(title, '') || ' ' || COALESCE(summary, '') || ' ' || COALESCE(content, '') ILIKE ${`%${query}%`})
    ORDER BY score DESC
    LIMIT ${topK}
  `)

  return results.map(r => ({
    id: r.id,
    score: Number(r.score),
    similarity: Number(r.score) / 3.7, // 归一化相似度 (max 3.7)
    title: r.title,
    content: r.content,
    summary: r.summary,
    isPublic: r.isPublic,
    category: r.category,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    highlight_title: r.highlight_title || undefined,
    highlight_summary: r.highlight_summary || undefined,
    highlight_content: r.highlight_content || undefined,
  }))
}

/**
 * 搜索笔记并过滤出用户有权访问的内容
 */
export async function searchKeepsWithAccess(query: string, userIds: string[], topK = 10) {
  const hits = await searchKeeps(query, topK)
  const ids = hits.map(h => h.id)

  if (ids.length === 0)
    return []

  const accessibleKeeps = await db.keep.findMany({
    where: {
      id: { in: ids },
      OR: [
        { ownerId: { in: userIds } },
        { isPublic: true },
      ],
    },
    select: {
      id: true,
      isPublic: true,
      category: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  const keepsMap = new Map(accessibleKeeps.map(k => [k.id, k]))

  return hits
    .filter(h => keepsMap.has(h.id))
    .map((h) => {
      const k = keepsMap.get(h.id)!
      return {
        ...h,
        isPublic: k.isPublic,
        category: k.category,
        createdAt: k.createdAt,
        updatedAt: k.updatedAt,
      }
    })
}

/**
 * 语义搜索 Keep
 */
export async function semanticSearch(query: string, userIds: string[], topK = 10) {
  return semanticSearchKeeps(query, userIds, topK)
}

/**
 * 混合搜索：关键词搜索 + 语义搜索，使用 RRF 融合排序
 */
export async function hybridSearch(query: string, userIds: string[], topK = 10) {
  // 并发执行关键词搜索和语义搜索
  const [keywordHits, semanticResults] = await Promise.all([
    searchKeeps(query, topK).catch(() => [] as KeywordSearchHit[]),
    semanticSearchKeeps(query, userIds, topK * 2).catch(() => []),
  ])

  // 关键词搜索结果 -> 权限过滤
  const keywordIds = keywordHits.map(h => h.id)

  let accessibleKeywordItems: Array<{ id: string, score: number }> = []
  if (keywordIds.length > 0) {
    const accessibleKeeps = await db.keep.findMany({
      where: {
        id: { in: keywordIds },
        OR: [
          { ownerId: { in: userIds } },
          { isPublic: true },
        ],
      },
      select: { id: true },
    })
    const accessibleSet = new Set(accessibleKeeps.map(k => k.id))
    accessibleKeywordItems = keywordHits
      .filter(h => accessibleSet.has(h.id))
  }

  // RRF 融合排序
  const fusedResults = hybridRankFusion(accessibleKeywordItems, semanticResults)

  return {
    results: fusedResults,
    keywordCount: accessibleKeywordItems.length,
    semanticCount: semanticResults.length,
    totalCount: fusedResults.length,
  }
}
