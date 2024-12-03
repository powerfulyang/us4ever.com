import type { ReactNode } from 'react'
import UserIcon from '@/components/user/icon'
import Link from 'next/link'

export default async function FullLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-purple-900 via-indigo-900 to-black">
      <div className="relative min-h-[100dvh] flex flex-col">
        <header className="sticky top-0 z-50">
          <div
            className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 backdrop-blur-xl"
          />
          <div className="relative max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <nav className="flex items-center gap-8">
                <Link
                  href="/"
                  className="group flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5 text-purple-400 group-hover:text-white transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span className="font-medium text-gray-300 group-hover:text-white transition-colors">首页</span>
                </Link>
              </nav>
              <UserIcon />
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
          {children}
        </main>

        <footer className="mt-auto border-t border-white/10 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <p className="text-center text-sm text-gray-400 flex gap-2 items-center justify-center">
              <span>© 2024</span>
              <span>
                Power By
                <a
                  href="https://github.com/pissy"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-gray-300 hover:text-white transition-colors pl-1"
                >
                  pissy
                </a>
              </span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
