import type { Metadata } from 'next'
import Link from 'next/link'
import { KeepCategoryServer } from '@/app/(full-layout)/keep/components/category'
import { KeepList } from '@/app/(full-layout)/keep/components/list'
import { AuthenticatedOnly } from '@/components/auth/owner-only'
import { Container } from '@/components/layout/Container'
import { SearchForm } from '@/components/search-form'
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
        rightContent={(
          <AuthenticatedOnly disableChildren>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <SearchForm className="flex-1" searchPath="/keep/search" />
              <Button>
                <Link href="/keep/save">创建笔记</Link>
              </Button>
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
