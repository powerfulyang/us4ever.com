import type { Metadata } from 'next'
import { Container } from '@/components/layout/Container'
import { MomentCategoryMap } from '@/constants/moment'
import { api, HydrateClient } from '@/trpc/server'
import { MomentCreate } from '../../components/create'
import { MomentList } from '../../components/list'

interface PageProps {
  params: Promise<{
    category: string
  }>
}

function getTitle(category: keyof typeof MomentCategoryMap) {
  return MomentCategoryMap[category].title
}

function getDescription(category: keyof typeof MomentCategoryMap) {
  return MomentCategoryMap[category].description
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = (await params).category as keyof typeof MomentCategoryMap

  return {
    title: getTitle(category),
    description: getDescription(category),
    alternates: {
      canonical: `/moment/category/${category}`,
    },
  }
}

export default async function MomentPage({ params }: PageProps) {
  const category = (await params).category as keyof typeof MomentCategoryMap
  await api.moment.list.prefetch({ category })
  return (
    <HydrateClient>
      <Container
        title={getTitle(category)}
        description={getDescription(category)}
      >
        <div className="space-y-6 max-w-[500px] m-auto">
          <MomentCreate category={category} />
          <MomentList category={category} />
        </div>
      </Container>
    </HydrateClient>
  )
}
