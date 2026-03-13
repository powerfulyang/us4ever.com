import type { Metadata } from 'next'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { KeepCategoryServer } from '@/app/(full-layout)/keep/components/category'
import { PaginationList } from '@/app/(full-layout)/keep/components/pagination-list'
import { ViewToggle } from '@/app/(full-layout)/keep/components/view-toggle'
import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { api, HydrateClient } from '@/trpc/server'

export const metadata: Metadata = {
  title: '笔记本',
  description: '记录灵感与思考的地方',
  alternates: {
    canonical: `/keep`,
  },
}

export default async function KeepPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string, page?: string }>
}) {
  const { category, page: pageParam } = await searchParams
  const page = pageParam ? Number.parseInt(pageParam, 10) : 1

  // 预取第一页数据
  await api.keep.fetchByPage.prefetch({
    page: Math.max(1, page),
    pageSize: 10,
    category,
  })

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
        <KeepCategoryServer currentCategory={category} />
        <PaginationList category={category} page={Math.max(1, page)} />
      </Container>
    </HydrateClient>
  )
}
