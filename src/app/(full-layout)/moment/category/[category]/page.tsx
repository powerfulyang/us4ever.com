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
  const category = (await params).category
  const decoded = decodeURIComponent(category) as keyof typeof MomentCategoryMap
  return {
    title: getTitle(decoded),
    description: getDescription(decoded),
    alternates: {
      canonical: `/moment/category/${decoded}`,
    },
  }
}

export default async function MomentPage({ params }: PageProps) {
  const category = (await params).category
  const decoded = decodeURIComponent(category) as keyof typeof MomentCategoryMap
  await api.moment.list.prefetch({ category: decoded })
  return (
    <HydrateClient>
      <Container
        title={getTitle(decoded)}
        description={getDescription(decoded)}
      >
        <div className="space-y-6 max-w-[500px] m-auto">
          <MomentCreate category={decoded} />
          <MomentList category={decoded} />
        </div>
      </Container>
    </HydrateClient>
  )
}
