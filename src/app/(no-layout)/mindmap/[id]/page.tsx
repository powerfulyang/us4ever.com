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
  const { title, summary } = await api.mindmap.getById({ id })

  return {
    title: title || 'MindMap - Detail',
    description: summary || 'MindMap - Description',
  }
}

export default async function Page({ params }: PageProps) {
  const id = (await params).id
  const { content, editable } = await api.mindmap.getById({ id, updateViews: true })

  return (
    <MindMapDetailPage editable={editable} data={content} />
  )
}
