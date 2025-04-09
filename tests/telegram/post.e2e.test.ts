import { sync_telegram } from '@/lib/telegram'

describe('telegram', () => {
  it('should sync telegram', async () => {
    const result = await sync_telegram()
    expect(result).toBe(true)
  }, Infinity)
})
