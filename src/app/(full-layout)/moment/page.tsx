import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { Container } from '@/components/layout/Container'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { api, HydrateClient } from '@/trpc/server'
import { MomentCategoryServer } from './components/category'
import { MomentCreate } from './components/create'
import { MomentPaginationClient } from './components/pagination-client'
import { ViewToggle } from './components/view-toggle'
import 'react-photo-view/dist/react-photo-view.css'

export const metadata: Metadata = {
  title: '动态',
  description: '分享生活点滴',
  alternates: {
    canonical: `/moment`,
  },
}

type VisibilityType = 'all' | 'public' | 'private'

export default async function MomentPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string, page?: string, visibility?: string }>
}) {
  const { category, page: pageParam, visibility: visibilityParam } = await searchParams
  const page = pageParam ? Number.parseInt(pageParam, 10) : 1
  const visibility: VisibilityType = (visibilityParam as VisibilityType) || 'all'

  await api.moment.fetchByPage.prefetch({
    page: Math.max(1, page),
    pageSize: DEFAULT_PAGE_SIZE,
    category,
    visibility,
  })

  return (
    <HydrateClient>
      <Container
        title="动态"
        description="分享生活点滴"
        actions={(
          <div className="flex items-center gap-2">
            <AuthenticatedOnly>
              <VisibilityFilter visibility={visibility} category={category} />
            </AuthenticatedOnly>
            <ViewToggle category={category} />
          </div>
        )}
      >
        <div className="max-w-2xl mx-auto space-y-4">
          <MomentCreate category={category} />
          <MomentCategoryServer currentCategory={category} basePath="/moment" visibility={visibility} />
          <Suspense fallback={null}>
            <MomentPaginationClient category={category} visibility={visibility} initialPage={Math.max(1, page)} />
          </Suspense>
        </div>
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
    return query ? `/moment?${query}` : '/moment'
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
