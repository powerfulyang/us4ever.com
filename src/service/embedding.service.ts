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

  // 使用 Gemini API
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${env.GEMINI_API_KEY}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'models/text-embedding-004',
      content: {
        parts: [{ text }],
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('Gemini Embedding Error:', error)
    throw new Error(`Gemini API error: ${response.statusText}`)
  }

  const result = await response.json()
  return result.embedding.values
}
