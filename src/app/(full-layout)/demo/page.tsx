import type { LinkProps } from '@/app/(full-layout)/page'
import { ArrowLeftRight, Clock, Edit, Mic } from 'lucide-react'
import { LinkGrid } from '@/components/link-grid'

const demoLinks: LinkProps[] = [
  {
    title: 'fetch upload progress',
    description: '使用 fetch 时获取上传进度',
    href: '/demo/upload',
    target: '_blank',
    icon: <ArrowLeftRight className="w-8 h-8" />,
  },
  {
    title: '字幕工具',
    description: 'AI 生成视频字幕，使用 faster-whisper',
    href: 'https://subtitle.us4ever.com',
    target: '_blank',
    icon: <Mic className="w-8 h-8" />,
  },
  {
    title: 'Excel/CSV 数据解析器',
    description: '上传 Excel 或 CSV 文件，自动解析为 JSON',
    href: '/demo/data-parser',
    target: '_blank',
    icon: <Clock className="w-8 h-8" />,
  },
  {
    title: 'Image Editor',
    description: '图片编辑器',
    href: '/demo/image-editor',
    target: '_blank',
    icon: <Edit className="w-8 h-8" />,
  },
]

export default function Demo() {
  return (
    <div className="space-y-8">
      <LinkGrid links={demoLinks} title="Demo" />
    </div>
  )
}
