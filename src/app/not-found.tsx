import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 - 页面未找到',
  description: '抱歉，您访问的页面不存在',
}

export default function NotFoundScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="px-4 text-center">
        <h1 className="mb-2 text-8xl font-bold text-gray-800">404</h1>
        <p className="mb-8 text-xl text-gray-600">页面未找到</p>
        <a
          href="/"
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          返回首页
        </a>
      </div>
    </div>
  )
}
