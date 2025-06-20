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
  return MomentCategoryMap[category]?.title || category
}

function getDescription(category: keyof typeof MomentCategoryMap) {
  return MomentCategoryMap[category]?.description || category
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
  await api.moment.fetchByCursor.prefetch({ category: decoded })
  return (
    <HydrateClient>
      <Container
        title={getTitle(decoded)}
        description={getDescription(decoded)}
      >
        <div className="space-y-4 max-w-[500px] m-auto">
          <MomentCreate category={decoded} />
          <MomentList category={decoded} />
        </div>
      </Container>
    </HydrateClient>
  )
}
