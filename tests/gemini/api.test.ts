import { summaryTitle } from '@/lib/gemini'
import { describe } from 'vitest'

describe('gemini', () => {
  it('should summary title', async () => {
    const title = await summaryTitle('这是一段测试内容')
    expect(title.length).toBeLessThanOrEqual(20)
  }, Infinity)
})
