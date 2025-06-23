'use client'

import dynamic from 'next/dynamic'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const MindMapView = dynamic(
  () => import('@/app/(full-layout)/mindmap/components'),
  {
    ssr: false,
    loading: () => <LoadingSpinner text="加载中..." />,
  },
)

interface Props {
  data: any
  editable?: boolean
  id: string
  isPublic?: boolean
}

export function MindMapDetailPage({ data, editable, id, isPublic }: Props) {
  return <MindMapView editable={editable} data={data} id={id} isPublic={isPublic} />
}
