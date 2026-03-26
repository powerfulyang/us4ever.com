import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { Container } from '@/components/layout/Container'
import { api, HydrateClient } from '@/trpc/server'

export const metadata: Metadata = {
  title: '标签',
  description: '按标签浏览内容',
  alternates: {
    canonical: '/tag',
  },
}

type FilterType = 'all' | 'public' | 'private'

interface TagPageProps {
  searchParams: Promise<{ filter?: FilterType }>
}

export default async function TagPage({ searchParams }: TagPageProps) {
  const { filter: filterParam } = await searchParams
  const filter: FilterType = filterParam || 'all'

  // 预取所有标签
  await api.tag.getAll.prefetch({ filter })

  return (
    <HydrateClient>
      <Container
        title="标签"
        description="按标签浏览所有内容"
        actions={(
          <AuthenticatedOnly>
            <FilterToggle filter={filter} />
          </AuthenticatedOnly>
        )}
      >
        <TagList filter={filter} />
      </Container>
    </HydrateClient>
  )
}

function FilterToggle({ filter }: { filter: FilterType }) {
  const filters: { key: FilterType, label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'public', label: '仅公开' },
    { key: 'private', label: '仅私密' },
  ]

  return (
    <div className="flex items-center gap-1">
      {filters.map(({ key, label }) => (
        <Link
          key={key}
          href={key === 'all' ? '/tag' : `/tag?filter=${key}`}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            filter === key
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  )
}

async function TagList({ filter }: { filter: FilterType }) {
  const tags = await api.tag.getAll({ filter })

  if (tags.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">暂无标签</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {tags.map(tag => (
        <Link
          key={tag.name}
          href={`/tag/${encodeURIComponent(tag.name)}${filter !== 'all' ? `?filter=${filter}` : ''}`}
          className="group relative flex flex-col items-center justify-center p-4 rounded-lg bg-background/50 hover:bg-background transition-all"
        >
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {tag.name}
          </span>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            {tag.keepCount > 0 && (
              <span>
                {tag.keepCount}
                {' '}
                笔记
              </span>
            )}
            {tag.momentCount > 0 && (
              <span>
                {tag.momentCount}
                {' '}
                动态
              </span>
            )}
          </div>
          <span className="absolute top-2 right-2 text-xs text-muted-foreground/50">
            {tag.total}
          </span>
        </Link>
      ))}
    </div>
  )
}
