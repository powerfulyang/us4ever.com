/**
 * Keep Service 类型定义
 */

/**
 * 关键词搜索单条结果
 */
export interface KeywordSearchHit {
  id: string
  score: number
  similarity?: number
  title: string | null
  content: string
  summary: string | null
  isPublic: boolean
  category: string
  createdAt: Date
  updatedAt: Date
  highlight_title?: string
  highlight_summary?: string
  highlight_content?: string
}
