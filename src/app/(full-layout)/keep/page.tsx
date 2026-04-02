import type { Metadata } from 'next'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { KeepCategoryServer } from '@/app/(full-layout)/keep/components/category'
import { KeepPaginationClient } from '@/app/(full-layout)/keep/components/pagination-client'
import { ViewToggle } from '@/app/(full-layout)/keep/components/view-toggle'
import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { api, HydrateClient } from '@/trpc/server'

export const metadata: Metadata = {
  title: '笔记本',
  description: '记录灵感与思考的地方',
  alternates: {
    canonical: `/keep`,
  },
}

type VisibilityType = 'all' | 'public' | 'private'

export default async function KeepPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string, page?: string, visibility?: string }>
}) {
  const { category, page: pageParam, visibility: visibilityParam } = await searchParams
  const page = pageParam ? Number.parseInt(pageParam, 10) : 1
  const visibility: VisibilityType = (visibilityParam as VisibilityType) || 'all'

  // 预取第一页数据
  await api.keep.fetchByPage.prefetch({
    page: Math.max(1, page),
    pageSize: DEFAULT_PAGE_SIZE,
    category,
    visibility,
  })

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
                <Link href={`/keep/save${category ? `?category=${category}` : ''}`}>
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
        <KeepCategoryServer currentCategory={category} basePath="/keep" visibility={visibility} />
        <KeepPaginationClient category={category} visibility={visibility} initialPage={Math.max(1, page)} />
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
    return query ? `/keep?${query}` : '/keep'
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
