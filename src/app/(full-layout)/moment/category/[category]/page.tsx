import type { Metadata } from 'next'
import { Container } from '@/components/layout/Container'
import { api, HydrateClient } from '@/trpc/server'
import { MomentCreate } from '../../components/create'
import { MomentList } from '../../components/list'

interface PageProps {
  params: Promise<{
    category: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = (await params).category

  return {
    title: `点滴 - ${category}`,
    description: `记录点滴 - ${category}`,
    alternates: {
      canonical: `/moment/category/${category}`,
    },
  }
}

export default async function MomentPage({ params }: PageProps) {
  const category = (await params).category
  await api.moment.list.prefetch({ category })
  return (
    <HydrateClient>
      <Container
        title={`点滴 - ${category}`}
        description="记录点滴"
      >
        <div className="space-y-6 max-w-[500px] m-auto">
          <MomentCreate category={category} />
          <MomentList category={category} />
        </div>
      </Container>
    </HydrateClient>
  )
}
