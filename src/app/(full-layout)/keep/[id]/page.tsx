import type { Metadata } from 'next'
import dayjs from 'dayjs'
import { ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'
import { Back } from '@/app/(full-layout)/keep/components/back'
import { OwnerOnly } from '@/components/auth/owner-only'
import RemoteMdx from '@/components/md-render/remote'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Waline } from '@/components/waline'
import { api } from '@/trpc/server'

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
          className="mt-6 px-6 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:scale-105"
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
          <ArrowLeft className="w-4 h-4" />
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
                  leftIcon={<Edit className="w-4 h-4" />}
                  className="hidden sm:flex"
                >
                  编辑笔记
                </Button>
                <Edit className="w-6 h-6 sm:hidden text-gray-200 mr-2 my-auto" />
              </Link>
            </OwnerOnly>
          </div>

          <RemoteMdx enableMermaid>
            {keep.content}
          </RemoteMdx>
        </Card>

      </div>
      <div className="max-w-4xl m-auto">
        <Waline />
      </div>
    </>
  )
}
