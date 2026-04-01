import type { MomentSearchHit } from './types'
/**
 * Moment 搜索服务 - 关键词、语义、混合搜索
 */
import { Prisma } from '@prisma/client'
import { db } from '@/server/db'
import { imageInclude, videoInclude } from '@/service/asset.service'
import { hybridRankFusion, semanticSearchMoments } from '../vector-search.service'
import { transformMomentResponse } from './transformer'

/**
 * 搜索动态
 * @param searchTerm 搜索关键词
 * @returns 搜索结果列表
 */
export async function searchMoments(searchTerm: string, topK = 100): Promise<MomentSearchHit[]> {
  const query = searchTerm.trim()
  if (!query) {
    return []
  }

  // 使用 PostgreSQL pg_trgm 进行相似度搜索
  const results = await db.$queryRaw<any[]>(Prisma.sql`
    SELECT
      id, content, "isPublic", category, "createdAt", "updatedAt",
      (word_similarity(${query}::text, COALESCE(content, ''))) as score,
      ts_headline('simple', COALESCE(content, ''), websearch_to_tsquery('simple', ${query}), 'StartSel=<mark>, StopSel=</mark>') as highlight_content
    FROM moments
    WHERE
      (${query}::text <% COALESCE(content, ''))
      OR (COALESCE(content, '') ILIKE ${`%${query}%`})
    ORDER BY score DESC
    LIMIT ${topK}
  `)

  return results.map(r => ({
    id: r.id,
    score: Number(r.score),
    similarity: Number(r.score),
    content: r.content,
    isPublic: r.isPublic,
    category: r.category,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    highlight_content: r.highlight_content || undefined,
  }))
}

/**
 * 为搜索命中的 ID 列表填充完整动态数据
 */
async function enrichSearchHits(hits: MomentSearchHit[], userIds: string[]) {
  const ids = hits.map(h => h.id)
  if (ids.length === 0)
    return []

  const list = await db.moment.findMany({
    include: {
      images: {
        include: {
          image: {
            include: imageInclude,
          },
        },
        orderBy: {
          sort: 'asc',
        },
      },
      videos: {
        include: {
          video: {
            include: videoInclude,
          },
        },
        orderBy: {
          sort: 'asc',
        },
      },
      owner: true,
    },
    where: {
      id: { in: ids },
      OR: [
        { ownerId: { in: userIds } },
        { isPublic: true },
      ],
    },
  })

  // 转换为Map以便按命中结果的顺序排序
  const momentsMap = new Map(
    list.map(
      moment => [
        moment.id,
        transformMomentResponse(moment),
      ],
    ),
  )

  // 按照原始搜索命中的顺序返回，并保留原有的 hit 信息
  return hits
    .filter(h => momentsMap.has(h.id))
    .map(h => ({
      ...momentsMap.get(h.id)!,
      ...h,
    }))
}

/**
 * 搜索动态并返回结果
 */
export async function searchAndFetchMoments(query: string, userIds: string[]) {
  if (!query.trim()) {
    return []
  }

  const resultList = await searchMoments(query)
  const ids = resultList.map(hit => hit.id)

  const list = await db.moment.findMany({
    include: {
      images: {
        include: {
          image: {
            include: imageInclude,
          },
        },
        orderBy: {
          sort: 'asc',
        },
      },
      videos: {
        include: {
          video: {
            include: videoInclude,
          },
        },
        orderBy: {
          sort: 'asc',
        },
      },
      owner: true,
    },
    where: {
      id: {
        in: ids,
      },
      OR: [
        {
          ownerId: {
            in: userIds,
          },
        },
        { isPublic: true },
      ],
    },
  })

  // 转换为Map以便按原始搜索结果的顺序排序
  const momentsMap = new Map(
    list.map(
      moment => [
        moment.id,
        {
          ...transformMomentResponse(moment),
          content: resultList.find(hit => hit.id === moment.id)?.highlight_content || moment.content,
        },
      ],
    ),
  )

  // 按照原始搜索结果的顺序返回
  return ids.filter(id => momentsMap.has(id)).map(id => momentsMap.get(id)!)
}

/**
 * 语义搜索 Moment
 */
export async function semanticSearch(query: string, userIds: string[], topK = 10) {
  const hitsRaw = await semanticSearchMoments(query, userIds, topK)
  const hits = hitsRaw.map(h => ({ ...h, score: h.similarity }))
  return enrichSearchHits(hits, userIds)
}

/**
 * 混合搜索 Moment
 */
export async function hybridSearch(query: string, userIds: string[], topK = 10) {
  const [keywordHits, semanticHitsRaw] = await Promise.all([
    searchMoments(query, topK).catch(() => [] as MomentSearchHit[]),
    semanticSearchMoments(query, userIds, topK * 2).catch(() => []),
  ])

  // Ensure semantic hits have a score for compatibility
  const semanticHits = semanticHitsRaw.map(h => ({ ...h, score: h.similarity }))

  const fusedHits = hybridRankFusion(keywordHits, semanticHits)

  // 为融合后的 ID 填充完整数据
  const enrichedResults = await enrichSearchHits(fusedHits, userIds)

  return {
    results: enrichedResults,
    keywordCount: keywordHits.length,
    semanticCount: semanticHits.length,
    totalCount: enrichedResults.length,
  }
}
