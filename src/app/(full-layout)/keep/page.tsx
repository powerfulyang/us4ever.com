import type { Metadata } from 'next'
import { KeepList } from '@/components/keep/list'
import { Button } from '@/components/ui/button'
import { api, HydrateClient } from '@/trpc/server'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Keep',
  description: 'A place to record inspiration and thinking',
}

export default async function KeepPage() {
  await api.keep.list.prefetch()
  return (
    <HydrateClient>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
            我的笔记本
          </h1>
          <p className="text-sm text-gray-400">记录灵感与思考的地方</p>
        </div>
        <Button>
          <Link href="/keep/save">创建笔记</Link>
        </Button>
      </div>
      <KeepList />
    </HydrateClient>
  )
}
