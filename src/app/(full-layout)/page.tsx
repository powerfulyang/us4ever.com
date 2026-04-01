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
  Image as ImageIcon,
  List,
  MessageCircle,
  Network,
  Package,
  Video,
  Zap,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
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
    href: '/keep/feed',
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    title: '待办事项',
    description: '管理你的待办任务',
    href: '/todo/feed',
    icon: <CheckSquare className="w-6 h-6" />,
  },
  {
    ...MomentCategoryMap.default,
    href: '/moment/feed',
    icon: <MessageCircle className="w-6 h-6" />,
  },
  {
    ...MomentCategoryMap.eleven,
    href: '/moment/feed?category=eleven',
    icon: <MessageCircle className="w-6 h-6" />,
  },
  {
    ...MomentCategoryMap['telegram:emt_channel'],
    href: '/moment/feed?category=telegram:emt_channel',
    icon: <MessageCircle className="w-6 h-6" />,
  },
  {
    title: '思维导图',
    description: '在线思维导图工具',
    href: '/mindmap/feed',
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
    href: '/image/feed',
    target: '_blank',
    icon: <ImageIcon className="w-6 h-6" />,
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
    href: 'https://uptime.us4ever.com/status/umami',
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
      <Image className="w-6 h-6" src="/icons/dify.avif" alt="" width={24} height={24} />
    ),
  },
]

function LinkGrid({ links, title }: { links: LinkProps[], title: string }) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground uppercase tracking-wider pl-1">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link) => {
          const isExternal = link.target === '_blank'
          const LinkComponent = isExternal ? 'a' : Link
          const linkProps = isExternal
            ? { href: link.href, target: link.target }
            : { href: link.href }

          return (
            <LinkComponent
              key={link.title}
              {...linkProps}
              className="group relative flex items-center gap-5 p-5 rounded-2xl bg-white/70 dark:bg-[hsl(230_25%_9%/0.6)] backdrop-blur-xl border border-black/[0.04] dark:border-white/[0.06] hover:-translate-y-1 transition-all duration-500 active:scale-[0.98] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:bg-white/80 dark:hover:bg-[hsl(230_25%_12%/0.7)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] dark:hover:border-white/[0.1]"
            >

              <div className="relative z-10 p-3 bg-primary/10 dark:bg-primary/20 text-primary rounded-[14px] group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm group-hover:shadow-[0_4px_20px_rgba(var(--primary-rgb),0.3)] group-hover:scale-110 shrink-0">
                {link.icon}
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <div className="text-[16px] font-bold text-foreground truncate group-hover:text-primary transition-colors duration-300">
                  {link.title}
                </div>
                <div className="text-[13px] text-muted-foreground truncate mt-1">
                  {link.description}
                </div>
              </div>
            </LinkComponent>
          )
        })}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
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
