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
  const keepId = (await params).id
  const keep = await api.keep.getById({ id: keepId })

  return <KeepEditor keep={keep} />
}
