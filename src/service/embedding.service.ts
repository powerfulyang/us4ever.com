import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '@/env'

/**
 * 为 Keep 数据生成向量
 * @param data 包含标题、内容和摘要的数据
 * @param data.title 笔记标题
 * @param data.content 笔记内容
 * @param data.summary 笔记摘要
 */
export async function generateKeepEmbeddings(data: {
  title?: string
  content: string
  summary?: string
}) {
  const result: {
    title_vector?: number[]
    content_vector: number[]
    summary_vector?: number[]
  } = {
    content_vector: [],
  }

  const tasks: Promise<void>[] = []

  if (data.title) {
    tasks.push(
      getEmbedding(data.title).then((v) => {
        result.title_vector = v
      }),
    )
  }

  tasks.push(
    getEmbedding(data.content).then((v) => {
      result.content_vector = v
    }),
  )

  if (data.summary) {
    tasks.push(
      getEmbedding(data.summary).then((v) => {
        result.summary_vector = v
      }),
    )
  }

  await Promise.all(tasks)
  return result
}

/**
 * 单条文本生成向量
 */
export async function getEmbedding(text: string): Promise<number[]> {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-2-preview' })

  const result = await model.embedContent(text)
  return result.embedding.values
}
