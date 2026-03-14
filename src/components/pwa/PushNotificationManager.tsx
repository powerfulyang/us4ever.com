'use client'

import type { PushSubscriptionJSON, WebPushSubscription } from '@/types/push'
import { Bell, BellOff, Check, Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { subscribeUser, unsubscribeUser } from '@/app/actions/web-push'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

interface PushNotificationManagerProps {
  onSubscribe?: () => void
  onUnsubscribe?: () => void
}

export default function PushNotificationManager({ onSubscribe, onUnsubscribe }: PushNotificationManagerProps) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg)
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub)
        })
      })
    }
  }, [])

  const subscribe = async () => {
    try {
      setIsLoading(true)
      if (!registration)
        return

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      const json = subscription.toJSON() as PushSubscriptionJSON
      const webPushSubscription: WebPushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: json.keys?.p256dh || '',
          auth: json.keys?.auth || '',
        },
      }

      await subscribeUser(webPushSubscription)
      onSubscribe?.()
      setIsSubscribed(true)
      setError(null)
    }
    catch (err) {
      setError('订阅推送通知失败，请确保已授予通知权限')
      console.error('推送通知订阅错误:', err)
    }
    finally {
      setIsLoading(false)
    }
  }

  const unsubscribe = async () => {
    try {
      setIsLoading(true)
      if (!registration)
        return

      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        await unsubscribeUser(subscription.endpoint)
        onUnsubscribe?.()
        setIsSubscribed(false)
        setError(null)
      }
    }
    catch (err) {
      setError('取消订阅失败')
      console.error('取消订阅错误:', err)
    }
    finally {
      setIsLoading(false)
    }
  }

  if (!registration || !('Notification' in window)) {
    return (
      <div className="rounded-xl bg-muted/50 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
          <BellOff className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          您的浏览器不支持推送通知功能
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 状态卡片 */}
      <div
        className={cn(
          'rounded-xl p-5 border',
          isSubscribed
            ? 'bg-green-500/5 border-green-500/20'
            : 'bg-muted/30 border-border/50',
        )}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
              isSubscribed
                ? 'bg-green-500/10 text-green-600'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {isSubscribed
              ? (
                  <Check className="w-6 h-6" />
                )
              : (
                  <Bell className="w-6 h-6" />
                )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium">
              {isSubscribed ? '已开启推送通知' : '推送通知未开启'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isSubscribed
                ? '您将收到系统发送的推送通知'
                : '开启后即可接收实时消息推送'}
            </p>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center flex-shrink-0 mt-0.5">
            <X className="w-3 h-3 text-destructive-foreground" />
          </div>
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* 操作按钮 */}
      <Button
        type="button"
        onClick={isSubscribed ? unsubscribe : subscribe}
        disabled={isLoading}
        variant={isSubscribed ? 'outline' : 'default'}
        className={cn(
          'w-full h-11',
          isSubscribed
            ? 'border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive'
            : '',
        )}
      >
        {isLoading
          ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                处理中...
              </>
            )
          : isSubscribed
            ? (
                <>
                  <BellOff className="w-4 h-4 mr-2" />
                  取消推送通知
                </>
              )
            : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  开启推送通知
                </>
              )}
      </Button>
    </div>
  )
}
