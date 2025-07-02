'use client'

import { useMutation } from '@tanstack/react-query'
import { LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Confirm } from '@/components/ui/confirm'
import LoginButton from '@/components/user/login-button'
import { useUserStore } from '@/store/user'

interface Props {
  onLogoutAction: () => Promise<void>
}

export default function UserIcon({ onLogoutAction }: Props) {
  const { isPending, currentUser } = useUserStore()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const { isPending: isLogoutPending, mutate } = useMutation({
    mutationFn() {
      return onLogoutAction()
    },
    onSuccess() {
      window.location.reload()
    },
  })

  if (isPending) {
    return (
      <div className="flex items-center gap-4 px-4 py-2 rounded-full bg-white/5">
        <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
        <div className="w-20 h-5 bg-white/10 animate-pulse rounded" />
      </div>
    )
  }

  if (!currentUser) {
    return <LoginButton />
  }

  return (
    <div className="group relative">
      <div className="flex items-center gap-4 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
        <img
          src={currentUser.avatar}
          alt={currentUser.nickname}
          width={32}
          height={32}
          className="rounded-full border-2 border-transparent group-hover:border-purple-500 transition-colors overflow-hidden"
        />
        <span className="text-gray-300 group-hover:text-white transition-colors max-w-[120px] truncate">
          {currentUser.nickname}
        </span>
      </div>

      <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-black/40 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        <Link
          href="/profile"
          className="flex items-center w-full h-10 px-4 text-left text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <User className="w-4 h-4 mr-2" />
          个人中心
        </Link>
        <div className="border-t border-white/20 my-2" />
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center w-full h-10 px-4 text-left text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          退出登录
        </button>
      </div>

      <Confirm
        isOpen={showLogoutConfirm}
        isConfirmLoading={isLogoutPending}
        onCloseAction={() => setShowLogoutConfirm(false)}
        onConfirmAction={mutate}
        title="退出登录"
        content="确定要退出登录吗？"
      />
    </div>
  )
}
