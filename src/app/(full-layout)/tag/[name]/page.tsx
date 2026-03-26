import type { Metadata } from 'next'
import Link from 'next/link'
import { KeepCard } from '@/app/(full-layout)/keep/components/keep-card'
import { MomentItem } from '@/app/(full-layout)/moment/components/item'
import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { Container } from '@/components/layout/Container'
import { Empty } from '@/components/layout/Empty'
import { api, HydrateClient } from '@/trpc/server'

type FilterType = 'all' | 'public' | 'private'

interface TagDetailPageProps {
  params: Promise<{ name: string }>
  searchParams: Promise<{ filter?: string }>
}

export async function generateMetadata({ params }: TagDetailPageProps): Promise<Metadata> {
  const { name } = await params
  const decodedName = decodeURIComponent(name)
  return {
    title: `标签: ${decodedName}`,
    description: `浏览标签 "${decodedName}" 下的所有内容`,
    alternates: {
      canonical: `/tag/${name}`,
    },
  }
}

export default async function TagDetailPage({ params, searchParams }: TagDetailPageProps) {
  const { name } = await params
  const decodedName = decodeURIComponent(name)
  const { filter: filterParam } = await searchParams
  const filter: FilterType = (filterParam as FilterType) || 'all'

  // 获取该标签的内容
  const content = await api.tag.getContentByTag({
    tag: decodedName,
    filter,
    limit: 50,
  })

  return (
    <HydrateClient>
      <Container
        title={`标签: ${decodedName}`}
        description={`${content.total} 个内容`}
        actions={(
          <div className="flex items-center gap-2">
            <AuthenticatedOnly>
              <FilterToggle tag={decodedName} filter={filter} />
            </AuthenticatedOnly>
            <Link
              href="/tag"
              className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              返回标签列表
            </Link>
          </div>
        )}
      >
        {content.total === 0
          ? (
              <Empty title="暂无内容" description={`在标签 "${decodedName}" 下没有找到匹配的内容`} />
            )
          : (
              <div className="space-y-12">
                {content.keeps.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-primary rounded-full" />
                      <span>笔记</span>
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        (
                        {content.keeps.length}
                        )
                      </span>
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {content.keeps.map(keep => (
                        <KeepCard key={keep.id} keep={keep as any} />
                      ))}
                    </div>
                  </section>
                )}

                {content.moments.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-pink-500 rounded-full" />
                      <span>动态</span>
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        (
                        {content.moments.length}
                        )
                      </span>
                    </h2>
                    <div className="grid gap-6 grid-cols-1 max-w-3xl mx-auto">
                      {content.moments.map(moment => (
                        <MomentItem key={moment.id} moment={moment as any} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
      </Container>
    </HydrateClient>
  )
}

function FilterToggle({ tag, filter }: { tag: string, filter: FilterType }) {
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
          href={key === 'all' ? `/tag/${encodeURIComponent(tag)}` : `/tag/${encodeURIComponent(tag)}?filter=${key}`}
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
