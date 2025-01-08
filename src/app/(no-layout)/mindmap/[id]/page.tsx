import { api } from '@/trpc/server'
import { MindMapDetailPage } from './components'

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function Page({ params }: Props) {
  const id = (await params).id
  const { content } = await api.mindmap.getById({ id })

  return (
    <MindMapDetailPage data={content} />
  )
}
