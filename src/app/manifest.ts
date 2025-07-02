import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Eleven Resource Hub',
    short_name: 'Eleven',
    description: '体验最智能、便捷的应用服务',
    start_url: '/',
    display: 'standalone',
    background_color: '#4f46e5',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    orientation: 'portrait',
    prefer_related_applications: false,
  }
}
