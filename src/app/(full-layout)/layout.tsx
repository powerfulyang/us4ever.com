import type { ReactNode } from 'react'
import { Home } from 'lucide-react'
import Link from 'next/link'
import { logout } from '@/app/actions'
import UserIcon from '@/components/user/icon'

export default async function FullLayout(
  { children }: Readonly<{ children: ReactNode }>,
) {
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
                  className="group flex items-center gap-4 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300"
                >
                  <Home className="w-5 h-5 text-purple-400 group-hover:text-white transition-colors" />
                  <span className="font-medium text-gray-300 group-hover:text-white transition-colors">首页</span>
                </Link>
              </nav>
              <UserIcon onLogoutAction={logout} />
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto p-8">
          {children}
        </main>

        <footer className="mt-auto border-t border-white/10 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <p className="text-center text-sm text-gray-400 flex gap-2 items-center justify-center">
              <span>© 2024</span>
              <span>
                Power By
                <a
                  href="https://github.com/powerfulyang"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-gray-300 hover:text-white transition-colors pl-[1ch]"
                >
                  powerfulyang
                </a>
              </span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
