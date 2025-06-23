import type { Metadata } from 'next'
import { Container } from '@/components/layout/Container'
import { SearchForm } from '@/components/search-form'
import { getDescription, getTitle } from '@/constants/moment'
import { api, HydrateClient } from '@/trpc/server'
import { MomentCategoryServer } from '../../components/category'
import { MomentCreate } from '../../components/create'
import { MomentList } from '../../components/list'

interface MomentPageProps {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: MomentPageProps): Promise<Metadata> {
  const category = decodeURIComponent((await params).category)

  return {
    title: getTitle(category),
    description: getDescription(category),
    alternates: {
      canonical: `/moment/category/${category}`,
    },
  }
}

export default async function MomentCategoryPage({ params }: MomentPageProps) {
  const category = decodeURIComponent((await params).category)

  await api.moment.fetchByCursor.prefetch({
    category,
  })

  return (
    <HydrateClient>
      <Container
        title={getTitle(category)}
        description={getDescription(category)}
      >
        <div className="space-y-4 max-w-[500px] m-auto">
          <SearchForm
            searchPath="/moment/search"
            placeholder="支持搜索动态内容和图片文字"
          />
          <MomentCreate category={category} />
          <MomentCategoryServer currentCategory={category} />
          <MomentList category={category} />
        </div>
      </Container>
    </HydrateClient>
  )
}
