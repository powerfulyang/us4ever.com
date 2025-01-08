'use client'

import { LoadingSpinner } from '@/components/ui/loading-spinner'
import dynamic from 'next/dynamic'

const MindMapView = dynamic(
  () => import('@/components/mindmap').then(m => m.MindMapView),
  {
    ssr: false,
    loading: () => <LoadingSpinner text="加载中..." />,
  },
)

interface Props {
  data: any
}

export function MindMapDetailPage({ data }: Props) {
  return <MindMapView data={data} />
}
