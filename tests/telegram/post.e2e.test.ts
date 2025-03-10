import { syncTelegram } from '@/lib/sync.telegram'

describe('telegram', () => {
  it('should sync telegram', async () => {
    const result = await syncTelegram()
    expect(result).toBe(true)
  })
})
