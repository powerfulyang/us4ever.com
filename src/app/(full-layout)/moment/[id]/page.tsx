import type { Metadata } from 'next'
import { Back } from '@/app/(full-layout)/keep/components/back'
import { Container } from '@/components/layout/Container'
import { Waline } from '@/components/waline'
import { api, HydrateClient } from '@/trpc/server'
import { MomentItem } from '../components/item'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const momentId = (await params).id
  const moment = await api.moment.getById({ id: momentId })

  return {
    title: `${moment.owner.nickname}的动态`,
    description: moment.content || '分享生活点滴',
    alternates: {
      canonical: `/moment/${momentId}`,
    },
  }
}

export default async function MomentDetailPage({ params }: PageProps) {
  const momentId = (await params).id
  const moment = await api.moment.getById({ id: momentId, updateViews: true })

  return (
    <HydrateClient>
      <Container
        title={`${moment.owner.nickname} 的动态`}
        description="动态详情"
        actions={(
          <Back
            fallback="/moment"
            className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            返回列表
          </Back>
        )}
      >
        <div className="space-y-4 max-w-xl mx-auto">
          <MomentItem moment={moment} />
        </div>

        <div className="max-w-xl mx-auto mt-6">
          <Waline />
        </div>
      </Container>
    </HydrateClient>
  )
}
