import type { LinkProps } from '@/app/(full-layout)/page'
import { LinkGrid } from '@/app/(full-layout)/page'

const demoLinks: LinkProps[] = [
  {
    title: 'fetch upload progress',
    description: '使用 fetch 时获取上传进度',
    href: '/demo/upload',
    target: '_blank',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    title: 'video list',
    description: '上传的视频',
    href: '/demo/video',
    target: '_blank',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
]

export default function Demo() {
  return (
    <div className="space-y-8">
      <LinkGrid links={demoLinks} title="Demo" />
    </div>
  )
}
