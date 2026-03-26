import type { Metadata } from 'next'
import { Plus } from 'lucide-react'
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

type VisibilityType = 'all' | 'public' | 'private'

export default async function KeepFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string, visibility?: string }>
}) {
  const { category, visibility: visibilityParam } = await searchParams
  const visibility: VisibilityType = (visibilityParam as VisibilityType) || 'all'

  // 预取第一页数据（用于无限滚动）
  await api.keep.fetchByCursor.prefetchInfinite({ category, visibility })

  return (
    <HydrateClient>
      <Container
        title="笔记本"
        description="记录灵感与思考的地方"
        actions={(
          <div className="flex items-center gap-2">
            <AuthenticatedOnly disableChildren>
              <div className="flex items-center gap-2">
                <AuthenticatedOnly>
                  <VisibilityFilter visibility={visibility} category={category} />
                </AuthenticatedOnly>
                <Link href="/keep/save">
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    创建笔记
                  </Button>
                </Link>
              </div>
            </AuthenticatedOnly>
            <ViewToggle category={category} />
          </div>
        )}
      >
        <KeepCategoryServer currentCategory={category} basePath="/keep/feed" visibility={visibility} />
        <KeepList category={category} visibility={visibility} />
      </Container>
    </HydrateClient>
  )
}

function VisibilityFilter({ visibility, category }: { visibility: VisibilityType, category?: string }) {
  const filters: { key: VisibilityType, label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'public', label: '公开' },
    { key: 'private', label: '私密' },
  ]

  const buildHref = (key: VisibilityType) => {
    const params = new URLSearchParams()
    if (category)
      params.set('category', category)
    if (key !== 'all')
      params.set('visibility', key)
    const query = params.toString()
    return query ? `/keep/feed?${query}` : '/keep/feed'
  }

  return (
    <div className="flex items-center gap-1">
      {filters.map(({ key, label }) => (
        <Link
          key={key}
          href={buildHref(key)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            visibility === key
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  )
}
