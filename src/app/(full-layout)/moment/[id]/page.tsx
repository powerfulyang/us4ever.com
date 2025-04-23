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
        rightContent={(
          <Back
            fallback="/moment"
            className="px-6 py-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:scale-105"
          >
            返回列表
          </Back>
        )}
      >
        <div className="space-y-4 max-w-xl m-auto">
          <MomentItem moment={moment} />
        </div>

        <div className="max-w-xl m-auto mt-6">
          <Waline />
        </div>
      </Container>
    </HydrateClient>
  )
}
