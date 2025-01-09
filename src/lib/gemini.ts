import { env } from '@/env'
import { GoogleGenerativeAI } from '@google/generative-ai'

// 初始化 Google AI 实例
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

/**
 * 为给定内容生成简短标题
 *
 * 使用 Gemini AI 模型为输入内容生成一个简洁的标题
 * 标题长度不超过20个字符,确保标题准确概括内容要点
 *
 * @param content - 需要生成标题的文本内容
 * @returns 返回生成的标题
 */
export async function extractTitle(content: string): Promise<string> {
  const prompt
  = `根据以下内容生成一个不超过20个字符的简短标题：
+ 精准概括核心内容
+ 措辞简洁有力
+ 返回唯一明确结果
+ 不使用任何格式修饰`

  const result = await model.generateContent([prompt, content])
  return result.response.text()
}

/**
 * 为给定内容生成摘要
 *
 * 使用 Gemini AI 模型为输入内容生成一个清晰的摘要
 * 摘要长度不超过200个字符,保持内容的关键信息
 *
 * @param content - 需要生成摘要的文本内容
 * @returns 返回生成的摘要
 */
export async function summaryContent(content: string | string[]): Promise<string> {
  const contentList = Array.isArray(content) ? content : [content]
  const prompt
  = `根据以下内容生成一个不超过200字符的简明摘要：
+ 提炼内容关键信息
+ 语言清晰流畅
+ 输出单一完整的摘要
+ 使用 markdown 格式，无标题，无引用`
  console.log(contentList.join(''))

  const result = await model.generateContent([prompt, ...contentList])
  return result.response.text()
}
