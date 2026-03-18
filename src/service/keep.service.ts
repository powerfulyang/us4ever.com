import type { CreateKeepDTO, QueryKeepDTO, UpdateKeepDTO } from '@/dto/keep.dto'
import { Prisma } from '@prisma/client'
import { HTTPException } from 'hono/http-exception'
import { after } from 'next/server'
import { db } from '@/server/db'
import { generateKeepEmbeddings } from '@/service/embedding.service'
import { getCursor } from '@/service/index'
import { hybridRankFusion, semanticSearchKeeps } from '@/service/vector-search.service'

/**
 * 笔记查询时包含的关联数据
 */
export const keepInclude = {
  owner: true,
} as const

/**
 * 笔记资源类型
 */
export type KeepWithIncludes = Prisma.KeepGetPayload<{
  include: typeof keepInclude
}>

/**
 * 创建新的笔记
 * @param input 创建笔记的参数
 * @param ownerId
 * @returns 创建的笔记
 */
export async function createKeep(input: CreateKeepDTO, ownerId: string) {
  const {
    content,
    isPublic = false,
    tags = [],
    category = 'default',
  } = input

  const keep = await db.keep.create({
    include: keepInclude,
    data: {
      content,
      isPublic,
      tags,
      category,
      ownerId,
    },
  })

  // 异步生成向量，不阻塞主请求
  after(updateKeepVectors(keep.id, { content }))

  return keep
}

/**
 * 更新笔记内容
 * @param input 更新笔记的参数
 * @param id
 * @param ownerId
 * @returns 更新后的笔记
 */
export async function updateKeep(input: UpdateKeepDTO, id: string, ownerId: string) {
  const {
    title,
    content,
    summary,
    isPublic,
    tags,
    category,
  } = input

  const keep = await db.keep.update({
    include: keepInclude,
    where: {
      id,
      ownerId,
    },
    data: {
      title,
      content,
      summary,
      isPublic,
      tags,
      category,
    },
  })

  // 当文本内容发生变化时，异步重新生成向量
  if (title !== undefined || content !== undefined || summary !== undefined) {
    after(updateKeepVectors(id, {
      title: keep.title,
      content: keep.content,
      summary: keep.summary,
    }))
  }

  return keep
}

/**
 * 根据ID获取笔记
 * @param id 笔记ID
 * @param userIds 用户ID列表
 * @param updateViews
 * @returns 笔记详情
 */
export async function getKeepById(id: string, userIds: string[], updateViews: boolean) {
  const keep = await db.keep.findFirst({
    include: keepInclude,
    where: {
      id,
      OR: [
        {
          // Allow owner to see their own private keeps
          ownerId: {
            in: userIds,
          },
        },
        // Allow anyone to see public keeps
        { isPublic: true },
      ],
    },
  })

  if (!keep) {
    throw new HTTPException(404, { message: '笔记不存在或无权访问' })
  }

  // Only increment views if not the owner
  if (updateViews && !userIds.includes(keep.ownerId)) {
    // Update view count asynchronously (fire-and-forget) for better performance
    after(incrementKeepViews(id))
  }

  return keep
}

/**
 * 增加笔记浏览次数
 * @param id 笔记ID
 * @returns 更新后的笔记
 */
export async function incrementKeepViews(id: string) {
  return db.keep.update({
    where: { id },
    data: { views: { increment: 1 } },
  })
}

/**
 * 删除笔记
 * @param id 笔记ID
 * @param ownerId 所有者ID
 * @returns 删除的笔记
 */
export async function deleteKeep(id: string, ownerId: string) {
  return db.keep.delete({
    where: {
      id,
      ownerId,
    },
  })
}

async function findPublicList() {
  return db.keep.findMany({
    where: {
      isPublic: true,
    },
    select: {
      id: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })
}

// 查找用户可访问的列表
async function findAccessibleList(query: QueryKeepDTO, userIds: string[]) {
  const { limit = 10, cursor, category } = query

  const items = await db.keep.findMany({
    take: limit + 1,
    where: {
      category,
      OR: [
        {
          ownerId: {
            in: userIds,
          },
        },
        {
          isPublic: true,
        },
      ],
    },
    cursor: getCursor(cursor),
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      owner: {
        select: {
          id: true,
          nickname: true,
          avatar: true,
        },
      },
    },
  })

  let nextCursor: string | undefined
  if (items.length > limit) {
    const nextItem = items.pop()
    nextCursor = nextItem!.id
  }

  return {
    items,
    nextCursor,
  }
}

// 分页查找用户可访问的列表
async function findAccessiblePage(
  query: { page: number, pageSize: number, category?: string },
  userIds: string[],
): Promise<{
  items: KeepWithIncludes[]
  total: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}> {
  const { page, pageSize, category } = query
  const skip = (page - 1) * pageSize

  // 获取总数
  const total = await db.keep.count({
    where: {
      category,
      OR: [
        {
          ownerId: {
            in: userIds,
          },
        },
        {
          isPublic: true,
        },
      ],
    },
  })

  // 获取分页数据
  const items = await db.keep.findMany({
    skip,
    take: pageSize,
    where: {
      category,
      OR: [
        {
          ownerId: {
            in: userIds,
          },
        },
        {
          isPublic: true,
        },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: keepInclude,
  })

  const totalPages = Math.ceil(total / pageSize)

  return {
    items,
    total,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

// 搜索结果接口定义
export interface SearchResult {
  hits: Hits
}

export interface Hits {
  total: Total
  hits: Hit[]
}

export interface Hit {
  _index: string
  _id: string
  _score: number
  _source: Source
  highlight?: Highlight
}

export interface Source {
  content: string
  summary: string
  title: string
  isPublic: boolean
  category: string
  createdAt: string
  updatedAt: string
}

export interface Highlight {
  summary?: string[]
  title?: string[]
  content?: string[]
}

export interface Total {
  value: number
  relation: string
}

/**
 * 使用 Postgres 原生全文检索搜索笔记
 * @param searchTerm 搜索关键词
 * @returns 搜索结果（保持原有 SearchResult 格式以兼容现有代码）
 */
async function searchKeeps(searchTerm: string): Promise<SearchResult> {
  const query = searchTerm.trim()
  if (!query) {
    return { hits: { total: { value: 0, relation: 'eq' }, hits: [] } }
  }

  // 使用 PostgreSQL pg_trgm 进行相似度搜索，对模糊搜索和中文搜索更友好
  const results = await db.$queryRaw<any[]>(Prisma.sql`
    SELECT
      id, title, content, summary, "isPublic", category,
      "createdAt", "updatedAt",
      (
        word_similarity(${query}, COALESCE(title, '')) * 1.5 +
        word_similarity(${query}, COALESCE(summary, '')) * 1.2 +
        word_similarity(${query}, COALESCE(content, '')) * 1.0
      ) as score,
      ts_headline('simple', COALESCE(title, ''), websearch_to_tsquery('simple', ${query}), 'StartSel=<mark>, StopSel=</mark>') as highlight_title,
      ts_headline('simple', COALESCE(summary, ''), websearch_to_tsquery('simple', ${query}), 'StartSel=<mark>, StopSel=</mark>') as highlight_summary,
      ts_headline('simple', COALESCE(content, ''), websearch_to_tsquery('simple', ${query}), 'StartSel=<mark>, StopSel=</mark>') as highlight_content
    FROM keeps
    WHERE
      (${query} <% (COALESCE(title, '') || ' ' || COALESCE(summary, '') || ' ' || COALESCE(content, '')))
      OR (COALESCE(title, '') || ' ' || COALESCE(summary, '') || ' ' || COALESCE(content, '') ILIKE ${`%${query}%`})
    ORDER BY score DESC
    LIMIT 50
  `)

  return {
    hits: {
      total: { value: results.length, relation: 'eq' },
      hits: results.map(r => ({
        _index: 'keeps',
        _id: r.id,
        _score: Number(r.score),
        _source: {
          title: r.title,
          content: r.content,
          summary: r.summary,
          isPublic: r.isPublic,
          category: r.category,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        },
        highlight: {
          title: r.highlight_title ? [r.highlight_title] : undefined,
          summary: r.highlight_summary ? [r.highlight_summary] : undefined,
          content: r.highlight_content ? [r.highlight_content] : undefined,
        },
      })),
    },
  }
}

/**
 * 搜索笔记并过滤出用户有权访问的内容
 * @param query 搜索关键词
 * @param userIds 用户ID列表
 * @returns 过滤后的搜索结果
 */
async function searchKeepsWithAccess(query: string, userIds: string[]) {
  const result = await searchKeeps(query)
  const resultList = result.hits.hits
  const ids = resultList.map((hit: any) => hit._id)

  const accessibleKeeps = await db.keep.findMany({
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
    select: {
      id: true,
      isPublic: true,
      category: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  // 创建一个 map 方便查找
  const keepsMap = new Map(accessibleKeeps.map(k => [k.id, k]))

  // 合并数据库数据到搜索结果
  const mergedResults = resultList
    .filter(hit => keepsMap.has(hit._id))
    .map((hit) => {
      const keepData = keepsMap.get(hit._id)!
      return {
        ...hit,
        _source: {
          ...hit._source,
          isPublic: keepData.isPublic,
          category: keepData.category,
          createdAt: keepData.createdAt.toISOString(),
          updatedAt: keepData.updatedAt.toISOString(),
        },
      }
    })

  return mergedResults
}

async function getCategories(userIds: string[]) {
  const categories = await db.keep.findMany({
    select: {
      category: true,
    },
    where: {
      OR: [
        { ownerId: { in: userIds } },
        { isPublic: true },
      ],
    },
    distinct: ['category'],
  })
  return categories.map(category => category.category)
}

/**
 * 为指定 Keep 生成并更新向量
 * @param keepId Keep ID
 * @param data 包含 title、content、summary 的文本数据
 * @param data.title 笔记标题
 * @param data.content 笔记内容
 * @param data.summary 笔记摘要
 */
async function updateKeepVectors(
  keepId: string,
  data: { title?: string, content: string, summary?: string },
) {
  try {
    const vectors = await generateKeepEmbeddings(data)
    await db.keep.update({
      where: { id: keepId },
      data: {
        title_vector: vectors.title_vector ?? undefined,
        content_vector: vectors.content_vector,
        summary_vector: vectors.summary_vector ?? undefined,
      },
    })
    console.log(`[RAG] Vectors updated for Keep ${keepId}`)
  }
  catch (error) {
    // 向量生成失败不应影响主流程
    console.error(`[RAG] Failed to update vectors for Keep ${keepId}:`, error)
  }
}

/**
 * 语义搜索 Keep
 * @param query 搜索查询文本
 * @param userIds 可访问的用户 ID 列表
 * @param topK 返回结果数
 */
async function semanticSearch(query: string, userIds: string[], topK = 10) {
  return semanticSearchKeeps(query, userIds, topK)
}

/**
 * 混合搜索：关键词搜索 + 语义搜索，使用 RRF 融合排序
 * @param query 搜索查询文本
 * @param userIds 可访问的用户 ID 列表
 */
async function hybridSearch(query: string, userIds: string[]) {
  // 并发执行关键词搜索和语义搜索
  const [keywordResult, semanticResults] = await Promise.all([
    searchKeeps(query).catch(() => ({ hits: { hits: [], total: { value: 0, relation: '' } } })),
    semanticSearchKeeps(query, userIds, 20).catch(() => []),
  ])

  // 关键词搜索结果 -> 权限过滤
  const keywordHits = keywordResult.hits.hits
  const keywordIds = keywordHits.map((hit: any) => hit._id)

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
      .filter(hit => accessibleSet.has(hit._id))
      .map(hit => ({ id: hit._id, score: hit._score }))
  }

  // RRF 融合排序
  const fusedResults = hybridRankFusion(accessibleKeywordItems, semanticResults.map(r => ({ ...r, id: r.id })))

  return {
    results: fusedResults,
    keywordCount: accessibleKeywordItems.length,
    semanticCount: semanticResults.length,
    totalCount: fusedResults.length,
  }
}

/**
 * 批量回填向量（管理员使用）
 * 为所有没有向量的 Keep 生成向量
 * @param batchSize 每批处理数量
 */
async function backfillVectors(batchSize = 10) {
  const keeps = await db.keep.findMany({
    where: {
      content_vector: { equals: Prisma.DbNull },
    },
    select: {
      id: true,
      title: true,
      content: true,
      summary: true,
    },
    take: batchSize,
  })

  if (keeps.length === 0) {
    return { processed: 0, remaining: 0 }
  }

  let processed = 0
  for (const keep of keeps) {
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
  const remaining = await db.keep.count({
    where: {
      content_vector: { equals: Prisma.DbNull },
    },
  })

  return { processed, remaining }
}

export const keepService = {
  findAccessibleList,
  findAccessiblePage,
  findPublicList,
  createKeep,
  updateKeep,
  getKeepById,
  deleteKeep,
  incrementKeepViews,
  searchKeepsWithAccess,
  getCategories,
  semanticSearch,
  hybridSearch,
  backfillVectors,
}
