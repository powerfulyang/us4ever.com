import type { Metadata } from 'next'
import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { api, HydrateClient } from '@/trpc/server'
import { MindMapList } from './components'
import { MindMapImport } from './components/create'

export const metadata: Metadata = {
  title: '思维导图',
  description: '记录和分享你的思维导图',
}

export default async function MindMapPage() {
  await api.mindmap.list.prefetch()
  return (
    <HydrateClient>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
            思维导图
          </h1>
          <p className="text-sm text-gray-400">记录和分享你的思维导图</p>
        </div>
        <AuthenticatedOnly>
          <MindMapImport />
        </AuthenticatedOnly>
      </div>
      <MindMapList />
    </HydrateClient>
  )
}
