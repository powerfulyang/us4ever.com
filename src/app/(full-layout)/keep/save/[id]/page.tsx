import type { Metadata } from 'next'
import { api } from '@/trpc/server'
import KeepEditor from '../components/editor'

export const metadata: Metadata = {
  title: 'Keep - Update',
  description: 'Update a keep',
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function UpdatePage({ params }: PageProps) {
  const noteId = (await params).id
  const note = await api.keep.get({ id: noteId })

  return <KeepEditor note={note} />
}
