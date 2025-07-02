import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import {
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  Braces,
  CheckCircle,
  CheckSquare,
  Clock,
  Edit3,
  FileImage,
  Image,
  List,
  MessageCircle,
  Network,
  Package,
  Video,
  Zap,
} from 'lucide-react'
import React from 'react'
import { LinkGrid } from '@/components/link-grid'
import { MomentCategoryMap } from '@/constants/moment'

export const metadata: Metadata = {
  title: 'Resource Hub',
  description: 'A comprehensive hub for developers and tech enthusiasts, featuring coding tutorials, tools, libraries, and industry insights.',
  alternates: {
    canonical: `/`,
  },
}

export interface LinkProps {
  title: string
  description: string
  href: string
  target?: string
  icon: ReactNode
}

const appLinks: LinkProps[] = [
  {
    title: '笔记本',
    description: '记录灵感与思考的地方',
    href: '/keep',
    icon: <BookOpen className="w-8 h-8" />,
  },
  {
    title: '待办事项',
    description: '管理你的待办任务',
    href: '/todo',
    icon: <CheckSquare className="w-8 h-8" />,
  },
  {
    ...MomentCategoryMap.default,
    href: '/moment',
    icon: <MessageCircle className="w-8 h-8" />,
  },
  {
    ...MomentCategoryMap.eleven,
    href: '/moment/category/eleven',
    icon: <MessageCircle className="w-8 h-8" />,
  },
  {
    ...MomentCategoryMap.prompt,
    href: '/moment/category/prompt',
    icon: <MessageCircle className="w-8 h-8" />,
  },
  {
    ...MomentCategoryMap.keyword2blog,
    href: '/moment/category/keyword2blog',
    icon: <MessageCircle className="w-8 h-8" />,
  },
  {
    ...MomentCategoryMap['telegram:emt_channel'],
    href: '/moment/category/telegram:emt_channel',
    icon: <MessageCircle className="w-8 h-8" />,
  },
  {
    title: '思维导图',
    description: '在线思维导图工具',
    href: '/mindmap',
    icon: <Network className="w-8 h-8" />,
  },
]

const toyLinks: LinkProps[] = [
  {
    title: '文本对比',
    description: '在线文本差异对比工具',
    href: '/diff',
    target: '_blank',
    icon: <ArrowLeftRight className="w-8 h-8" />,
  },
  {
    title: 'JSON Viewer',
    description: 'JSON 数据查看器',
    href: 'https://json.us4ever.com/editor',
    target: '_blank',
    icon: <Braces className="w-8 h-8" />,
  },
  {
    title: '白板',
    description: '在线白板',
    href: '/draw',
    target: '_blank',
    icon: <Edit3 className="w-8 h-8" />,
  },
  {
    title: 'video list',
    description: '上传的视频',
    href: '/demo/video',
    target: '_blank',
    icon: <Video className="w-8 h-8" />,
  },
  {
    title: '图片管理',
    description: '便捷的图片上传与管理工具',
    href: '/image',
    icon: <Image className="w-8 h-8" />,
  },
  {
    title: '图片转 Base64',
    description: '将图片转换为 Base64 字符串',
    href: '/image/base64',
    icon: <FileImage className="w-8 h-8" />,
  },
  {
    title: 'Demo',
    description: '一些栗子',
    href: '/demo',
    icon: <Package className="w-8 h-8" />,
  },
]

const toolLinks: LinkProps[] = [
  // grafana
  {
    title: 'Grafana',
    description: 'Grafana 是一个开源的分析和监控平台，用于可视化数据和创建交互式仪表板。',
    href: 'https://grafana.us4ever.com',
    target: '_blank',
    icon: <Clock className="w-8 h-8" />,
  },
  // umami
  {
    title: 'Umami',
    description: '开源的网站访问统计分析工具',
    href: 'https://umami.us4ever.com',
    target: '_blank',
    icon: <BarChart3 className="w-8 h-8" />,
  },
  // uptime-kuma
  {
    title: 'Uptime Kuma',
    description: '简单的服务器监控工具',
    href: 'https://uptime.us4ever.com/status/up',
    target: '_blank',
    icon: <CheckCircle className="w-8 h-8" />,
  },
  // 1-panel
  {
    title: '1Panel',
    description: '现代化的 Linux 服务器运维管理面板',
    href: 'https://1panel.us4ever.com',
    target: '_blank',
    icon: <List className="w-8 h-8" />,
  },
  // rabbitmq management
  {
    title: 'RabbitMQ',
    description: 'RabbitMQ 消息队列管理面板',
    href: 'https://rabbit-mq-management.us4ever.com',
    target: '_blank',
    icon: <Zap className="w-8 h-8" />,
  },
  // Dify
  {
    title: 'Dify',
    description: 'Dify 是一个开源的智能对话平台，用于构建智能对话应用程序。',
    href: 'https://dify.us4ever.com',
    target: '_target',
    icon: (
      <img className="w-8 h-8" src="/icons/dify.avif" alt="" />
    ),
  },
]

export interface LinkGridProps {
  title: string
  links: LinkProps[]
}

export default function Home() {
  return (
    <div className="space-y-8">
      <LinkGrid links={appLinks} title="应用" />
      <LinkGrid links={toyLinks} title="玩意" />
      <LinkGrid links={toolLinks} title="工具" />
    </div>
  )
}
