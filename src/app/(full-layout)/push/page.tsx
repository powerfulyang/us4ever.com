'use client'

import { Bell, Check, ChevronDown, Loader2, Send, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getPushUsers, sendNotification } from '@/app/actions/web-push'
import PushNotificationManager from '@/components/pwa/PushNotificationManager'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/utils/cn'

interface PushUser {
  id: string
  name: string | null
  email: string
  subscriptionCount: number
}

export default function PushPage() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })
  const [isSending, setIsSending] = useState(false)
  const [users, setUsers] = useState<PushUser[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showUserSelector, setShowUserSelector] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  const loadUsers = async () => {
    setIsLoadingUsers(true)
    const result = await getPushUsers()
    if (result.success && result.users) {
      setUsers(result.users)
    }
    setIsLoadingUsers(false)
  }

  // 加载用户列表
  useEffect(() => {
    void loadUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim())
      return

    setIsSending(true)
    setStatus({ type: null, message: '' })

    try {
      // 如果没有选择特定用户，则发送给所有人
      const targetUserIds = selectedUsers.length > 0 ? selectedUsers : undefined
      const result = await sendNotification(message, targetUserIds)

      if (result.success) {
        setStatus({ type: 'success', message: `通知发送成功！共发送给 ${result.count} 个订阅` })
        setTitle('')
        setMessage('')
      }
      else {
        setStatus({ type: 'error', message: `发送失败: ${result.error || '未知错误'}` })
      }
    }
    catch (error) {
      setStatus({ type: 'error', message: `发送失败: ${error instanceof Error ? error.message : '未知错误'}` })
    }
    finally {
      setIsSending(false)
    }
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId],
    )
  }

  const selectAllUsers = () => {
    setSelectedUsers(users.map(u => u.id))
  }

  const clearSelection = () => {
    setSelectedUsers([])
  }

  return (
    <div className="mx-auto max-w-3xl w-full space-y-6">
      {/* 页面标题 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">推送通知</h1>
        <p className="text-muted-foreground">管理推送订阅并向用户发送通知</p>
      </div>

      {/* 订阅管理卡片 */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">订阅管理</CardTitle>
              <CardDescription>开启或关闭浏览器推送通知</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PushNotificationManager />
        </CardContent>
      </Card>

      {/* 发送通知卡片 */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center">
              <Send className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">发送通知</CardTitle>
              <CardDescription>向订阅用户发送推送消息</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 标题输入 */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                通知标题
              </label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="输入通知标题（可选）"
                className="h-11"
              />
            </div>

            {/* 内容输入 */}
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                通知内容
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="输入要发送的通知内容..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* 目标用户选择 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  目标用户
                </label>
                <span className="text-xs text-muted-foreground">
                  {selectedUsers.length > 0
                    ? `已选择 ${selectedUsers.length} 位用户`
                    : '未选择则发送给所有用户'}
                </span>
              </div>

              {/* 用户选择器 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserSelector(!showUserSelector)}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200',
                    'hover:bg-muted/50',
                    showUserSelector
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm">
                      {selectedUsers.length > 0
                        ? `已选择 ${selectedUsers.length} 位用户`
                        : '所有订阅用户'}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-muted-foreground transition-transform duration-200',
                      showUserSelector && 'rotate-180',
                    )}
                  />
                </button>

                {/* 下拉选择面板 */}
                {showUserSelector && (
                  <div className="absolute z-10 w-full mt-2 p-2 rounded-xl border border-border bg-card shadow-lg">
                    {/* 操作按钮 */}
                    <div className="flex items-center justify-between px-2 py-2 border-b border-border/50 mb-2">
                      <span className="text-xs text-muted-foreground">
                        {users.length}
                        {' '}
                        位可推送用户
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={selectAllUsers}
                          className="text-xs text-primary hover:underline"
                        >
                          全选
                        </button>
                        <span className="text-muted-foreground">·</span>
                        <button
                          type="button"
                          onClick={clearSelection}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          清空
                        </button>
                      </div>
                    </div>

                    {/* 用户列表 */}
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {isLoadingUsers
                        ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                            </div>
                          )
                        : users.length === 0
                          ? (
                              <div className="text-center py-6 text-sm text-muted-foreground">
                                暂无订阅用户
                              </div>
                            )
                          : (
                              users.map(user => (
                                <button
                                  key={user.id}
                                  type="button"
                                  onClick={() => toggleUserSelection(user.id)}
                                  className={cn(
                                    'w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left',
                                    selectedUsers.includes(user.id)
                                      ? 'bg-primary/10'
                                      : 'hover:bg-muted/50',
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'w-5 h-5 rounded border flex items-center justify-center transition-colors',
                                      selectedUsers.includes(user.id)
                                        ? 'bg-primary border-primary'
                                        : 'border-muted-foreground/30',
                                    )}
                                  >
                                    {selectedUsers.includes(user.id) && (
                                      <Check className="w-3.5 h-3.5 text-primary-foreground" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {user.name || user.email}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {user.subscriptionCount}
                                      {' '}
                                      个订阅端点
                                    </p>
                                  </div>
                                </button>
                              ))
                            )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 发送按钮 */}
            <Button
              type="submit"
              disabled={!message.trim() || isSending}
              className="w-full h-11"
              size="lg"
            >
              {isSending
                ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      发送中...
                    </>
                  )
                : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      发送通知
                    </>
                  )}
            </Button>

            {/* 状态提示 */}
            {status.message && (
              <div
                className={cn(
                  'rounded-xl p-4 flex items-start gap-3',
                  status.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-700'
                    : 'bg-destructive/10 border border-destructive/20 text-destructive',
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                    status.type === 'success' ? 'bg-green-500' : 'bg-destructive',
                  )}
                >
                  {status.type === 'success'
                    ? (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )
                    : (
                        <span className="text-primary-foreground text-xs">!</span>
                      )}
                </div>
                <p className="text-sm">{status.message}</p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
