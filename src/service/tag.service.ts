import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '@/env'
import { db } from '@/server/db'
import { logger } from '@/server/logger'
import { imageInclude, transformImageToResponse, transformVideoToResponse, videoInclude } from '@/service/asset.service'

const TAG_SEPARATOR_REGEX = /[,\uFF0C]/

/**
 * 根据内容生成标签
 * @param content 文本内容
 */
export async function generateTags(content: string): Promise<string[]> {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    generationConfig: {
      temperature: 0.7,
    },
  })

  const prompt = `请作为内容分类专家，阅读以下文本，并生成 5-8 个 高频且具代表性的标签。要求：
1. 包含 1-2 个宽泛的领域标签（如：技术、生活、情感）。
2. 包含 3-4 个具体的技术或主题标签（如 : Transformer、React、RAG）。
3. 使用中文，且每个标签长度不超过 10 个字。
4. 仅输出标签，用英文逗号分隔。

文本内容：
${content}`

  try {
    const response = await model.generateContent(prompt)
    const text = response.response.text().trim() || ''

    // 过滤掉可能包含的解释文字，只保留逗号分隔的部分
    const tags = text.split(TAG_SEPARATOR_REGEX).map((t: string) => t.trim()).filter((t: string) => t && t.length <= 10)
    return tags.slice(0, 8)
  }
  catch (error) {
    logger.internal.error('Failed to generate tags', { error, content: content.slice(0, 100) })
    return []
  }
}

/**
 * 获取所有标签及其使用统计
 * @param options 筛选选项
 * @param options.filter 筛选类型: 'all' | 'public' | 'private'
 * @param options.userIds 用户ID列表（用于权限筛选）
 */
export async function getAllTags(options: { filter?: 'all' | 'public' | 'private', userIds?: string[] } = {}) {
  const { filter = 'all', userIds = [] } = options

  // 构建 where 条件
  const buildWhereClause = () => {
    if (filter === 'public') {
      return { isPublic: true }
    }
    else if (filter === 'private') {
      if (userIds.length > 0) {
        return {
          isPublic: false,
          ownerId: { in: userIds },
        }
      }
      return { isPublic: false }
    }
    else if (userIds.length > 0) {
      return {
        OR: [
          { ownerId: { in: userIds } },
          { isPublic: true },
        ],
      }
    }
    return {}
  }

  // 从 Keep 获取标签
  const keeps = await db.keep.findMany({
    where: buildWhereClause(),
    select: {
      tags: true,
    },
  })

  // 从 Moment 获取标签
  const moments = await db.moment.findMany({
    where: buildWhereClause(),
    select: {
      tags: true,
    },
  })

  // 统计标签使用次数
  const tagMap = new Map<string, { keepCount: number, momentCount: number, total: number }>()

  keeps.forEach((keep) => {
    const tags = keep.tags as string[]
    tags.forEach((tag) => {
      const existing = tagMap.get(tag) || { keepCount: 0, momentCount: 0, total: 0 }
      tagMap.set(tag, {
        ...existing,
        keepCount: existing.keepCount + 1,
        total: existing.total + 1,
      })
    })
  })

  moments.forEach((moment) => {
    const tags = moment.tags as string[]
    tags.forEach((tag) => {
      const existing = tagMap.get(tag) || { keepCount: 0, momentCount: 0, total: 0 }
      tagMap.set(tag, {
        ...existing,
        momentCount: existing.momentCount + 1,
        total: existing.total + 1,
      })
    })
  })

  // 转换为数组并按使用次数排序
  const tags = Array.from(tagMap.entries())
    .map(([name, stats]) => ({
      name,
      ...stats,
    }))
    .sort((a, b) => b.total - a.total)

  logger.internal.info(`Retrieved ${tags.length} unique tags`)
  return tags
}

/**
 * 根据标签获取内容（Keep 和 Moment）
 * @param tag 标签名称
 * @param options 筛选选项
 * @param options.filter 筛选类型: 'all' | 'public' | 'private'
 * @param options.userIds 用户ID列表
 * @param options.limit 限制数量
 */
export async function getContentByTag(
  tag: string,
  options: { filter?: 'all' | 'public' | 'private', userIds?: string[], limit?: number } = {},
) {
  const { filter = 'all', userIds = [], limit = 50 } = options

  // 构建 where 条件
  const buildWhereClause = () => {
    const baseCondition = {
      tags: {
        array_contains: [tag],
      },
    }

    if (filter === 'public') {
      return {
        ...baseCondition,
        isPublic: true,
      }
    }
    else if (filter === 'private') {
      if (userIds.length > 0) {
        return {
          ...baseCondition,
          isPublic: false,
          ownerId: { in: userIds },
        }
      }
      return {
        ...baseCondition,
        isPublic: false,
      }
    }
    else if (userIds.length > 0) {
      return {
        ...baseCondition,
        OR: [
          { ownerId: { in: userIds } },
          { isPublic: true },
        ],
      }
    }
    return baseCondition
  }

  try {
    // 获取匹配的 Keep
    const keeps = await db.keep.findMany({
      where: buildWhereClause(),
      include: {
        owner: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // 获取匹配的 Moment
    const moments = await db.moment.findMany({
      where: buildWhereClause(),
      include: {
        owner: true,
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
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    logger.internal.info(`Retrieved content for tag "${tag}"`, {
      keepCount: keeps.length,
      momentCount: moments.length,
    })

    // 转换 moments 的数据
    const transformedMoments = moments.map(moment => ({
      ...moment,
      images: moment.images.map(({ image }) => transformImageToResponse(image as any)),
      videos: moment.videos.map(({ video }) => transformVideoToResponse(video as any)),
    }))

    return {
      keeps,
      moments: transformedMoments,
      total: keeps.length + moments.length,
    }
  }
  catch (error) {
    logger.internal.error(`Failed to get content for tag "${tag}"`, { error })
    return { keeps: [], moments: [], total: 0 }
  }
}
export async function updateAllMomentsTags() {
  const moments = await db.moment.findMany({
    where: {
      isPublic: true,
      tags: { equals: [] },
    },
    select: {
      id: true,
      content: true,
      images: {
        select: {
          image: {
            select: {
              description: true,
            },
          },
        },
      },
    },
  })

  logger.internal.info(`Starting tag generation for ${moments.length} moments`)

  let count = 0
  let i = 0
  for (const moment of moments) {
    i++
    const imageDescriptions = moment.images.map(img => img.image.description).filter(Boolean).join('\n')
    const fullContent = [moment.content, imageDescriptions].filter(Boolean).join('\n')
    if (!fullContent)
      continue
    logger.internal.info(`Wait tag generation for moment: ${i}/${moments.length}`, { id: moment.id })
    const tags = await generateTags(fullContent)
    logger.internal.info(`Generated tags for moment: ${moment.id}`, { tags })
    if (tags.length > 0) {
      await db.moment.update({
        where: { id: moment.id },
        data: { tags },
      })
      count++
    }
    // 添加小延时以防频率过快
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  logger.internal.info(`Finished tag generation for moments: ${count} updated`)
  return count
}

/**
 * 更新所有 Keep 的标签
 */
export async function updateAllKeepsTags() {
  const keeps = await db.keep.findMany({
    where: {
      isPublic: true,
      tags: { equals: [] },
    },
    select: { id: true, title: true, content: true, summary: true },
  })

  logger.internal.info(`Starting tag generation for ${keeps.length} keeps`)

  let count = 0
  let i = 0
  for (const keep of keeps) {
    i++
    const fullContent = [keep.title, keep.summary, keep.content].filter(Boolean).join('\n')
    if (!fullContent)
      continue
    logger.internal.info(`Wait tag generation for keep: ${i}/${keeps.length}`, { id: keep.id })
    const tags = await generateTags(fullContent)
    logger.internal.info(`Generated tags for keep: ${keep.id}`, { tags })
    if (tags.length > 0) {
      await db.keep.update({
        where: { id: keep.id },
        data: { tags },
      })
      count++
    }
    // 添加小延时以防频率过快
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  logger.internal.info(`Finished tag generation for keeps: ${count} updated`)
  return count
}
