'use client'

import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import PushNotificationManager from '@/components/pwa/PushNotificationManager'
import { Button, Input, Textarea } from '@/components/ui'
import { useUserStore } from '@/store/user'
import { api } from '@/trpc/react'
import { formatDateTime } from '@/utils'
import { cn } from '@/utils/cn'

interface UserSettings {
  nickname: string
  bio: string
}

export default function ProfilePage() {
  const { currentUser, isPending, setCurrentUser } = useUserStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications'>('profile')

  const [formData, setFormData] = useState<UserSettings>({
    nickname: '',
    bio: '',
  })

  useEffect(() => {
    if (!isPending && currentUser) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
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
      // 检查是否有推送订阅
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
      // 更新本地用户状态
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
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">请先登录</h2>
          <p className="text-gray-400">您需要登录才能访问个人中心</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">个人中心</h1>
        <p className="text-gray-400">管理您的个人信息和通知设置</p>
      </div>

      {/* 标签页导航 */}
      <div className="flex space-x-1 mb-8 bg-white/5 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={cn(
            'flex-1 py-2 px-4 rounded-md transition-colors text-sm font-medium',
            {
              'bg-white/10 text-white': activeTab === 'profile',
              'text-gray-400 hover:text-white': activeTab !== 'profile',
            },
          )}
        >
          个人信息
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={cn(
            'flex-1 py-2 px-4 rounded-md transition-colors text-sm font-medium',
            {
              'bg-white/10 text-white': activeTab === 'notifications',
              'text-gray-400 hover:text-white': activeTab !== 'notifications',
            },
          )}
        >
          通知设置
        </button>
      </div>

      {/* 个人信息标签页 */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6">基本信息</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center space-x-6 mb-6">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.nickname}
                  className="w-20 h-20 rounded-full border-2 border-purple-500"
                />
                <div>
                  <h3 className="text-lg font-medium text-white">{currentUser.nickname}</h3>
                  <p className="text-gray-400 text-sm">{currentUser.email}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    加入时间:
                    {formatDateTime(currentUser.createdAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    昵称
                  </label>
                  <Input
                    value={formData.nickname}
                    onChange={e => handleInputChange('nickname', e.target.value)}
                    placeholder="请输入昵称"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    邮箱
                  </label>
                  <Input
                    value={currentUser.email}
                    disabled
                    className="bg-white/5 border-white/20 text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  个人简介
                </label>
                <Textarea
                  value={formData.bio}
                  onChange={e => handleInputChange('bio', e.target.value)}
                  placeholder="介绍一下你自己..."
                  rows={4}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={updateProfileMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  保存更改
                </Button>
              </div>
            </form>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-2xl font-bold text-white">{userStats?.keepCount ?? 0}</div>
              <div className="text-gray-400 text-sm">笔记</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-2xl font-bold text-white">{userStats?.todoCount ?? 0}</div>
              <div className="text-gray-400 text-sm">待办</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-2xl font-bold text-white">{userStats?.mindMapCount ?? 0}</div>
              <div className="text-gray-400 text-sm">思维导图</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-2xl font-bold text-white">{userStats?.momentCount ?? 0}</div>
              <div className="text-gray-400 text-sm">动态</div>
            </div>
          </div>
        </div>
      )}

      {/* 通知设置标签页 */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6">推送通知</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="text-white font-medium">浏览器推送通知</h3>
                  <p className="text-gray-400 text-sm">接收重要更新和提醒</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={cn(
                    'text-sm',
                    notificationSettings?.isSubscribed ? 'text-green-400' : 'text-gray-400',
                  )}
                  >
                    {notificationSettings?.isSubscribed ? '已开启' : '未开启'}
                  </span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <PushNotificationManager onSubscribe={refetchNotificationSettings} onUnsubscribe={refetchNotificationSettings} />
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
