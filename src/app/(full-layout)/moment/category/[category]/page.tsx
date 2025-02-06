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

function getTitle(category: string) {
  if (category === 'eleven') {
    return 'Eleven 专栏'
  }
  if (category === 'prompt') {
    return 'prompt 收藏'
  }
  return `点滴 - ${category}`
}

function getDescription(category: string) {
  if (category === 'eleven') {
    return '记录 Eleven 的成长过程'
  }
  if (category === 'prompt') {
    return '收藏有趣的 prompt'
  }
  return `记录点滴 - ${category}`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = (await params).category

  return {
    title: getTitle(category),
    description: getDescription(category),
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
