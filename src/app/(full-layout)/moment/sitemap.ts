import type { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/constants'
import { api } from '@/trpc/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const moments = await api.moment.list_public()
  return moments.map(moment => ({
    url: `${BASE_URL}/moment/${moment.id}`,
    lastModified: moment.updatedAt,
    changeFrequency: 'daily',
    priority: 0.8,
  }))
}
