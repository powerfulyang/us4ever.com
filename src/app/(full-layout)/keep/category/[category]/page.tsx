import type { Metadata } from 'next'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { KeepCategoryServer } from '@/app/(full-layout)/keep/components/category'
import { KeepList } from '@/app/(full-layout)/keep/components/list'
import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { api, HydrateClient } from '@/trpc/server'

interface KeepPageProps {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: KeepPageProps): Promise<Metadata> {
  const category = decodeURIComponent((await params).category)

  return {
    title: `笔记本 - ${category}`,
    description: `记录灵感与思考的地方 - ${category}`,
    alternates: {
      canonical: `/keep/category/${category}`,
    },
  }
}

export default async function KeepCategoryPage({ params }: KeepPageProps) {
  const category = decodeURIComponent((await params).category)

  await api.keep.fetchByCursor.prefetch({
    category,
  })

  return (
    <HydrateClient>
      <Container
        title={`${category} 分类笔记`}
        description="记录灵感与思考的地方"
        actions={(
          <AuthenticatedOnly disableChildren>
            <div className="flex items-center gap-2">
              <Link href="/keep/search">
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
        <KeepList category={category} />
      </Container>
    </HydrateClient>
  )
}
