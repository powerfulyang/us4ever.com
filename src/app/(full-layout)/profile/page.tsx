'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileText,
  Map,
  User,
} from 'lucide-react'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import PushNotificationManager from '@/components/pwa/PushNotificationManager'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/store/user'
import { api } from '@/trpc/react'

interface UserSettings {
  nickname: string
  bio: string
}

export default function ProfilePage() {
  const { currentUser, isPending, setCurrentUser } = useUserStore()
  const [formData, setFormData] = useState<UserSettings>({
    nickname: '',
    bio: '',
  })

  useEffect(() => {
    if (!isPending && currentUser) {
      setFormData({
        nickname: currentUser.nickname || '',
        bio: currentUser.bio || '',
      })
    }
  }, [isPending, currentUser])

  // 获取用户通知设置
  const { data: notificationSettings, refetch: refetchNotificationSettings } = useQuery({
    queryKey: ['user-notification-settings'],
    queryFn: async () => {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        return { isSubscribed: !!subscription }
      }
      return { isSubscribed: false }
    },
    enabled: !!currentUser,
  })

  // 获取用户统计数据
  const { data: userStats } = api.user.getStats.useQuery(undefined, {
    enabled: !!currentUser,
  })

  // 更新用户信息
  const updateProfileMutation = api.user.updateProfile.useMutation({
    onSuccess: (updatedUser) => {
      toast.success('个人信息更新成功')
      setCurrentUser(updatedUser)
    },
    onError: (error) => {
      toast.error(`更新失败: ${error.message}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate({
      nickname: formData.nickname,
      bio: formData.bio,
    })
  }

  const handleInputChange = (field: keyof UserSettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!currentUser || isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">请先登录</h2>
          <p className="text-muted-foreground">您需要登录才能访问个人中心</p>
        </Card>
      </div>
    )
  }

  const stats = [
    { icon: BookOpen, label: '笔记', value: userStats?.keepCount ?? 0, color: 'text-blue-500' },
    { icon: CheckCircle2, label: '待办', value: userStats?.todoCount ?? 0, color: 'text-emerald-500' },
    { icon: Map, label: '思维导图', value: userStats?.mindMapCount ?? 0, color: 'text-amber-500' },
    { icon: FileText, label: '动态', value: userStats?.momentCount ?? 0, color: 'text-purple-500' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold tracking-tight">个人中心</h1>
        <p className="text-muted-foreground">管理您的个人信息和通知设置</p>
      </motion.div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            个人信息
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            通知设置
          </TabsTrigger>
        </TabsList>

        {/* 个人信息 */}
        <TabsContent value="profile" className="space-y-6">
          {/* 用户信息卡片 */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <Avatar className="w-24 h-24 border-4 border-primary/10">
                <AvatarImage src={currentUser.avatar} alt={currentUser.nickname} />
                <AvatarFallback className="text-2xl">{currentUser.nickname?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <h2 className="text-2xl font-semibold">{currentUser.nickname}</h2>
                <p className="text-muted-foreground">{currentUser.email}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    加入于
                    {new Date(currentUser.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* 编辑表单 */}
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">编辑资料</h3>
                <p className="text-sm text-muted-foreground">更新您的个人信息</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    昵称
                  </label>
                  <Input
                    value={formData.nickname}
                    onChange={e => handleInputChange('nickname', e.target.value)}
                    placeholder="请输入昵称"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    邮箱
                  </label>
                  <Input
                    value={currentUser.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">邮箱不可修改</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  个人简介
                </label>
                <Textarea
                  value={formData.bio}
                  onChange={e => handleInputChange('bio', e.target.value)}
                  placeholder="介绍一下你自己..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? '保存中...' : '保存更改'}
                </Button>
              </div>
            </form>
          </Card>

          {/* 统计信息 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 text-center hover:shadow-md transition-shadow">
                  <stat.icon className={cn('w-6 h-6 mx-auto mb-2', stat.color)} />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* 通知设置 */}
        <TabsContent value="notifications">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">推送通知</h3>
                <p className="text-sm text-muted-foreground">管理您的通知偏好设置</p>
              </div>

              <div className="flex items-center justify-between py-4 border-t">
                <div className="space-y-1">
                  <h4 className="font-medium">浏览器推送通知</h4>
                  <p className="text-sm text-muted-foreground">接收重要更新和提醒</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-sm font-medium',
                    notificationSettings?.isSubscribed ? 'text-emerald-500' : 'text-muted-foreground',
                  )}
                  >
                    {notificationSettings?.isSubscribed ? '已开启' : '未开启'}
                  </span>
                </div>
              </div>

              <PushNotificationManager
                onSubscribe={refetchNotificationSettings}
                onUnsubscribe={refetchNotificationSettings}
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
