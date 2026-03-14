'use client'

import { Film, Search } from 'lucide-react'
import Link from 'next/link'
import { VideoList } from './components/list'
import { VideoUpload } from './components/upload'

// ==================== 主页面组件 ====================
export default function VideoDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-25 via-pink-25 to-rose-50 dark:from-slate-950 dark:via-rose-950/20 dark:to-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 标题区域 - 马卡龙糖果风格 */}
        <div className="text-center mb-12">
          {/* 标签 */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/40 dark:to-rose-900/40 text-pink-600 dark:text-pink-300 text-sm font-semibold mb-6 shadow-sm">
            <Film className="w-4 h-4" />
            视频播放器
          </div>

          <div className="flex items-center justify-center gap-4">
            <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">
              我的视频库
            </h1>
            {/* 搜索按钮 */}
            <Link
              href="/search"
              className="mb-4 p-2.5 rounded-2xl bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/40 dark:to-rose-900/40 text-pink-600 dark:text-pink-300 hover:from-pink-200 hover:to-rose-200 dark:hover:from-pink-800/60 dark:hover:to-rose-800/60 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <Search className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            点击视频卡片即可加载并播放，支持进度条拖拽、静音切换等交互
          </p>
        </div>

        <div className="space-y-12">
          <div className="flex flex-col items-center">
            <VideoUpload />
          </div>
          <VideoList />
        </div>
      </div>
    </div>
  )
}