import type { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/constants'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/todo`,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/keep`,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/image`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/image/base64`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/diff`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/draw`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/demo/upload`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]
}
