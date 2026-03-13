'use client'

import { useMutation } from '@tanstack/react-query'
import { LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted">
        <div className="w-8 h-8 rounded-full bg-muted-foreground/20 animate-pulse" />
        <div className="w-20 h-4 bg-muted-foreground/20 animate-pulse rounded" />
      </div>
    )
  }

  if (!currentUser) {
    return <LoginButton />
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={currentUser.avatar} alt={currentUser.nickname} />
              <AvatarFallback>{currentUser.nickname?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline max-w-[100px] truncate text-sm">
              {currentUser.nickname}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {currentUser.nickname}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              个人中心
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogOut className="mr-2 h-4 w-4" />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>退出登录</AlertDialogTitle>
            <AlertDialogDescription>
              确定要退出登录吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => mutate()}
              disabled={isLogoutPending}
            >
              {isLogoutPending ? '退出中...' : '确认退出'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
