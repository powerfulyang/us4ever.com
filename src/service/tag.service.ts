import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '@/env'
import { db } from '@/server/db'
import { logger } from '@/server/logger'

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
    model: 'gemini-1.5-flash',
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
 * 更新所有 Moment 的标签
 */
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
