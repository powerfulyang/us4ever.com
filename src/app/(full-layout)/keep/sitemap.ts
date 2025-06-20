import type { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/constants'
import { api } from '@/trpc/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const keeps = await api.keep.fetchPublicItems()
  return keeps.map(keep => ({
    url: `${BASE_URL}/keep/${keep.id}`,
    lastModified: keep.updatedAt,
    changeFrequency: 'daily',
    priority: 0.8,
  }))
}
