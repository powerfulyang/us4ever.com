import type { Metadata } from 'next'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { KeepCategoryServer } from '@/app/(full-layout)/keep/components/category'
import { KeepList } from '@/app/(full-layout)/keep/components/list'
import { ViewToggle } from '@/app/(full-layout)/keep/components/view-toggle'
import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { api, HydrateClient } from '@/trpc/server'

export const metadata: Metadata = {
  title: '笔记本',
  description: '记录灵感与思考的地方',
  alternates: {
    canonical: `/keep/feed`,
  },
}

export default async function KeepFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams

  // 预取第一页数据（用于无限滚动）
  await api.keep.fetchByCursor.prefetch({ category })

  return (
    <HydrateClient>
      <Container
        title="笔记本"
        description="记录灵感与思考的地方"
        actions={(
          <AuthenticatedOnly disableChildren>
            <div className="flex items-center gap-2">
              <ViewToggle category={category} />
              <Link href="/search">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Search className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/keep/save">
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  创建笔记
                </Button>
              </Link>
            </div>
          </AuthenticatedOnly>
        )}
      >
        <KeepCategoryServer currentCategory={category} basePath="/keep/feed" />
        <KeepList category={category} />
      </Container>
    </HydrateClient>
  )
}
