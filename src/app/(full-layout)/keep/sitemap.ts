import type { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/constants'
import { api } from '@/trpc/server'

export async function generateSitemaps() {
  // Fetch the total number of keeps and calculate the number of sitemaps needed
  const total = await api.keep.total()
  const sitemaps = Math.ceil(total / 50000)
  console.log(sitemaps)
  return Array.from({ length: sitemaps }, (_, i) => ({ id: i }))
}

export default async function sitemap({
  id,
}: {
  id: number
}): Promise<MetadataRoute.Sitemap> {
  // Google's limit is 50,000 URLs per sitemap
  const start = id * 50000
  const end = start + 50000
  const keeps = await api.keep.list({
    start,
    end,
  })
  return keeps.map(keep => ({
    url: `${BASE_URL}/keep/${keep.id}`,
    lastModified: keep.updatedAt,
    changeFrequency: 'daily',
    priority: 0.8,
  }))
}
