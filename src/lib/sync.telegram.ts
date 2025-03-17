import { env } from '@/env'

export interface TelegramMessage {
  id: number
  message: string
  filePath: string
  groupedId: string
  createdAt: number
  updatedAt: number
}

export async function syncTelegram(offsetId = 0, limit = 10) {
  const params = new URLSearchParams({
    offsetId: offsetId.toString(),
    limit: limit.toString(),
    download_media: 'true',
  })
  const response = await fetch(
    `${env.TELEGRAM_API_ENDPOINT}/history?${params.toString()}`,
  )
  if (response.ok) {
    const messages: TelegramMessage[] = await response.json()
    return messages
  }
  return []
}
