import type { Metadata } from 'next'
import { api } from '@/trpc/server'
import { MindMapDetailPage } from './components'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const id = (await params).id
  const { title, summary } = await api.mindMap.getById({ id })

  return {
    title: title || 'MindMap - Detail',
    description: summary || 'MindMap - Description',
    alternates: {
      canonical: `/mindmap/${id}`,
    },
  }
}

export default async function Page({ params }: PageProps) {
  const id = (await params).id
  const mindMap = await api.mindMap.getById({ id, updateViews: true })
  const { content, editable, isPublic } = mindMap

  return (
    <MindMapDetailPage editable={editable} data={content} id={id} isPublic={isPublic} />
  )
}
