'use client'

import LoginButton from '@/components/user/login-button'
import { api } from '@/trpc/react'

export default function UserIcon() {
  const { isPending, data } = api.user.current.useQuery()

  if (isPending) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5">
        <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
        <div className="w-20 h-5 bg-white/10 animate-pulse rounded" />
      </div>
    )
  }

  if (!data) {
    return <LoginButton />
  }

  return (
    <div className="group relative">
      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
        <img
          src={data.avatar}
          alt={data.nickname}
          width={32}
          height={32}
          className="rounded-full border-2 border-transparent group-hover:border-purple-500 transition-colors overflow-hidden"
        />
        <span className="text-gray-300 group-hover:text-white transition-colors max-w-[120px] truncate">
          {data.nickname}
        </span>
      </div>

      <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-black/40 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        <button
          type="button"
          className="w-full h-10 px-4 text-left text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          退出登录
        </button>
      </div>
    </div>
  )
}
