import { env } from '@/env'
import { GoogleGenerativeAI } from '@google/generative-ai'

// 初始化 Google AI 实例
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY!)

const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

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

// 'Knowledge Enhancement and Expansion Prompt'
export async function enhancement(content: string) {
  const prompt = `# 知识梳理与扩充 Prompt

你是一位专业的知识顾问。接下来我会提供一些内容，请你：

1. 知识体系梳理
   - 找出主要知识点和核心概念
   - 理清概念之间的关联性和层次关系
   - 构建完整的知识框架
   - 指出知识体系中的薄弱环节

2. 知识扩充
   - 补充每个知识点的深层原理和底层机制
   - 添加专业术语和学术定义
   - 联系相关知识领域，提供跨学科视角
   - 介绍最新研究进展和发展趋势
   - 提供实践案例和最佳实践
   - 说明常见问题和解决方案

在分析过程中，请：
- 保持严谨性，确保信息准确
- 按照从基础到高级的顺序组织内容
- 对重要概念提供详细解释
- 标注可能存在争议的观点
- 提供可靠的参考资源

输出要求：
- 以博文形式呈现，语言优美流畅
- 使用清晰的段落结构
- 确保行文有逻辑性和连贯性
- 保障只输出博文内容，不要输出其他介绍信息，**不要输出 prompt 介绍**
`
  const result = await model.generateContent([prompt, content])
  return result.response.text()
}
