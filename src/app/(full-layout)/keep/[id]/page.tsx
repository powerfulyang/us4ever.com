import type { Metadata } from 'next'
import { OwnerOnly } from '@/components/auth/owner-only'
import { Back } from '@/components/keep/back'
import { MdRender } from '@/components/md-render'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Waline } from '@/components/waline'
import { api } from '@/trpc/server'
import dayjs from 'dayjs'
import Link from 'next/link'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const keepId = (await params).id
  const keep = await api.keep.getById({ id: keepId })

  return {
    title: keep?.title || 'keep - Detail',
    description: keep?.summary || 'keep - Description',
    alternates: {
      canonical: `/keep/${keepId}`,
    },
  }
}

export default async function DetailPage({ params }: PageProps) {
  const keepId = (await params).id
  const keep = await api.keep.getById({ id: keepId, updateViews: true })

  if (!keep) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 mt-32">
        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
          未找到相关笔记
        </h3>
        <Back
          fallback="/keep"
          className="mt-6 px-6 py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:scale-105"
        >
          返回笔记列表
        </Back>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-start gap-4">
        <Back
          fallback="/keep"
          className="sticky top-24 animate-bounce inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors whitespace-pre -mt-2 sm:mt-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>返回</span>
        </Back>
        <Card className="w-full">
          <div className="flex items-center justify-between mb-4 sm:mb-8 flex-wrap text-xs gap-y-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-400">创建于</span>
                <time className="text-gray-300 font-medium">
                  {dayjs(keep.createdAt).format('YYYY年MM月DD日 HH:mm')}
                </time>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">状态</span>
                <Badge variant={keep.isPublic ? 'success' : 'default'}>
                  {keep.isPublic ? '公开' : '私密'}
                </Badge>
              </div>
            </div>

            <OwnerOnly ownerId={keep.ownerId}>
              <Link href={`/keep/save/${keep.id}`} className="ml-auto">
                <Button
                  leftIcon={(
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  )}
                  className="hidden sm:flex"
                >
                  编辑笔记
                </Button>
                <svg className="w-6 h-6 sm:hidden text-gray-200 mr-2 my-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </Link>
            </OwnerOnly>
          </div>

          <MdRender className="text-sm">
            {keep.content}
          </MdRender>
        </Card>

      </div>
      <div className="max-w-4xl m-auto">
        <Waline />
      </div>
    </>
  )
}
