import { env } from '@/env'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

/**
 * Generate a short summary title for the given content.
 *
 * This function takes a string of content and uses the generative AI model
 * to create a brief summary not exceeding 20 characters.
 *
 * @param content - The text content to generate a summary for.
 * @returns A promise that resolves to the generated summary title.
 */
export async function summaryTitle(content: string): Promise<string> {
  // Define the prompt to guide the AI model in generating a summary
  const prompt = '请根据以下内容给内容生成一个简短的标题，只生成一个结果不要出现"或"这样的文字，不超过 20 个字符：'

  // Use the model to generate content based on the prompt and given content
  const result = await model.generateContent([prompt, content])

  // Extract and return the generated text response from the result
  return result.response.text()
}
