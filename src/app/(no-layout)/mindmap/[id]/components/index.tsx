'use client'

import { LoadingSpinner } from '@/components/ui/loading-spinner'
import dynamic from 'next/dynamic'

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
}

export function MindMapDetailPage({ data, editable }: Props) {
  return <MindMapView editable={editable} data={data} />
}
