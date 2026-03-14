import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '404 - 页面未找到',
  description: '抱歉，您访问的页面不存在',
}

export default function NotFoundScreen() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background animate-gradient-breathe">
      {/* 装饰性背景元素 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 size-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 size-96 rounded-full bg-secondary-foreground/5 blur-3xl" />
      </div>

      <div className="relative z-10 px-4">
        <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-8 md:p-12 shadow-xl max-w-md w-full text-center">
          {/* 404 数字 */}
          <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-primary to-secondary-foreground bg-clip-text text-transparent mb-2">
            404
          </h1>

          {/* 标题和描述 */}
          <p className="text-2xl font-semibold text-foreground mb-2">页面未找到</p>
          <p className="text-muted-foreground mb-8">抱歉，您访问的页面不存在或已被移除</p>

          {/* 返回按钮 */}
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:scale-105 active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
