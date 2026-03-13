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
  FileImage,
  Image,
  List,
  MessageCircle,
  Network,
  Package,
  Video,
  Zap,
} from 'lucide-react'
import * as React from 'react'
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
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    title: '待办事项',
    description: '管理你的待办任务',
    href: '/todo',
    icon: <CheckSquare className="w-6 h-6" />,
  },
  {
    ...MomentCategoryMap.default,
    href: '/moment',
    icon: <MessageCircle className="w-6 h-6" />,
  },
  {
    ...MomentCategoryMap.eleven,
    href: '/moment?category=eleven',
    icon: <MessageCircle className="w-6 h-6" />,
  },
  {
    ...MomentCategoryMap['telegram:emt_channel'],
    href: '/moment?category=telegram:emt_channel',
    icon: <MessageCircle className="w-6 h-6" />,
  },
  {
    title: '思维导图',
    description: '在线思维导图工具',
    href: '/mindmap',
    icon: <Network className="w-6 h-6" />,
  },
]

const toyLinks: LinkProps[] = [
  {
    title: '文本对比',
    description: '在线文本差异对比工具',
    href: 'https://pandora.us4ever.com/dev-toolkit',
    target: '_blank',
    icon: <ArrowLeftRight className="w-6 h-6" />,
  },
  {
    title: 'JSON Viewer',
    description: 'JSON 数据查看器',
    href: 'https://pandora.us4ever.com/json-viewer',
    target: '_blank',
    icon: <Braces className="w-6 h-6" />,
  },
  {
    title: 'video list',
    description: '上传的视频',
    href: '/demo/video',
    target: '_blank',
    icon: <Video className="w-6 h-6" />,
  },
  {
    title: '图片管理',
    description: '便捷的图片上传与管理工具',
    href: '/image',
    target: '_blank',
    icon: <Image className="w-6 h-6" />,
  },
  {
    title: '图片转 Base64',
    description: '将图片转换为 Base64 字符串',
    href: 'https://pandora.us4ever.com/text-codec',
    target: '_blank',
    icon: <FileImage className="w-6 h-6" />,
  },
  {
    title: 'Demo',
    description: '一些栗子',
    href: '/demo',
    target: '_blank',
    icon: <Package className="w-6 h-6" />,
  },
]

const toolLinks: LinkProps[] = [
  {
    title: 'Grafana',
    description: '开源的分析和监控平台',
    href: 'https://grafana.us4ever.com',
    target: '_blank',
    icon: <Clock className="w-6 h-6" />,
  },
  {
    title: 'Umami',
    description: '开源的网站访问统计分析工具',
    href: 'https://umami.us4ever.com',
    target: '_blank',
    icon: <BarChart3 className="w-6 h-6" />,
  },
  {
    title: 'Uptime Kuma',
    description: '简单的服务器监控工具',
    href: 'https://uptime.us4ever.com/status/up',
    target: '_blank',
    icon: <CheckCircle className="w-6 h-6" />,
  },
  {
    title: '1Panel',
    description: '现代化的 Linux 服务器运维管理面板',
    href: 'https://1panel.us4ever.com',
    target: '_blank',
    icon: <List className="w-6 h-6" />,
  },
  {
    title: 'RabbitMQ',
    description: 'RabbitMQ 消息队列管理面板',
    href: 'https://rabbit-mq-management.us4ever.com',
    target: '_blank',
    icon: <Zap className="w-6 h-6" />,
  },
  {
    title: 'Dify',
    description: '开源的智能对话平台',
    href: 'https://dify.us4ever.com',
    target: '_blank',
    icon: (
      <img className="w-6 h-6" src="/icons/dify.avif" alt="" />
    ),
  },
]

function LinkGrid({ links, title }: { links: LinkProps[], title: string }) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground uppercase tracking-wider pl-1">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map(link => (
          <a
            key={link.title}
            href={link.href}
            target={link.target}
            className="group flex items-center gap-4 p-4 bg-white/90 hover:bg-white transition-colors dark:bg-secondary/50 dark:hover:bg-secondary"
          >
            <div className="p-2.5 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {link.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-semibold text-foreground truncate">
                {link.title}
              </div>
              <div className="text-sm text-muted-foreground truncate mt-0.5">
                {link.description}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      {/* 柔和渐变背景 - 亮色模式 */}
      <div
        className="fixed inset-0 -z-10 animate-gradient-breathe dark:hidden"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 0%, hsl(270 50% 88% / 0.95), transparent 60%),
            radial-gradient(ellipse 50% 50% at 85% 30%, hsl(280 45% 86% / 0.85), transparent 50%),
            radial-gradient(ellipse 40% 40% at 15% 70%, hsl(260 50% 87% / 0.75), transparent 50%),
            radial-gradient(ellipse 60% 40% at 70% 85%, hsl(290 40% 89% / 0.65), transparent 50%)
          `,
        }}
      />

      {/* 柔和渐变背景 - 暗色模式 */}
      <div
        className="fixed inset-0 -z-10 animate-gradient-breathe hidden dark:block"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 0%, hsl(270 50% 22% / 0.9), transparent 60%),
            radial-gradient(ellipse 50% 50% at 85% 30%, hsl(280 45% 18% / 0.8), transparent 50%),
            radial-gradient(ellipse 40% 40% at 15% 70%, hsl(260 50% 20% / 0.7), transparent 50%),
            radial-gradient(ellipse 60% 40% at 70% 85%, hsl(290 40% 19% / 0.6), transparent 50%)
          `,
        }}
      />

      {/* 漂浮光晕装饰 - 亮色模式 */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl -z-10 animate-float-slow dark:hidden" />
      <div className="fixed bottom-20 right-10 w-80 h-80 bg-violet-300/15 rounded-full blur-3xl -z-10 animate-float-medium dark:hidden" />
      <div className="fixed top-1/2 left-1/3 w-64 h-64 bg-indigo-300/10 rounded-full blur-3xl -z-10 animate-float-fast dark:hidden" />

      {/* 漂浮光晕装饰 - 暗色模式 */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -z-10 animate-float-slow hidden dark:block" />
      <div className="fixed bottom-20 right-10 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl -z-10 animate-float-medium hidden dark:block" />
      <div className="fixed top-1/3 right-1/4 w-72 h-72 bg-violet-600/12 rounded-full blur-3xl -z-10 animate-float-fast hidden dark:block" />
      <div className="fixed bottom-1/3 left-1/4 w-56 h-56 bg-fuchsia-600/10 rounded-full blur-3xl -z-10 animate-float-slow hidden dark:block" style={{ animationDelay: '-5s' }} />

      {/* 细腻网格纹理 */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(25 20% 60%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(25 20% 60%) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="space-y-16 relative pb-10">
        {/* 标题区域 - 带微妙装饰 */}
        <div className="relative">
          <div className="absolute -left-4 -top-8 w-24 h-24 bg-gradient-to-br from-amber-200/20 to-orange-200/10 rounded-full blur-2xl" />
          <h1 className="text-3xl font-bold text-foreground relative">
            欢迎回来
          </h1>
          <p className="text-base text-muted-foreground mt-2 relative">
            这是你的个人工具集合
          </p>
        </div>

        <LinkGrid links={appLinks} title="应用" />
        <LinkGrid links={toyLinks} title="玩意" />
        <LinkGrid links={toolLinks} title="工具" />
      </div>
    </div>
  )
}
