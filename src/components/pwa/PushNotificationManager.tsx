import type { PushSubscriptionJSON, WebPushSubscription } from '@/types/push'
import { useEffect, useState } from 'react'
import { subscribeUser, unsubscribeUser } from '@/app/actions/web-push'
import { cn } from '@/utils/cn'

interface PushNotificationManagerProps {
  onSubscribe: () => void
  onUnsubscribe: () => void
}

export default function PushNotificationManager({ onSubscribe, onUnsubscribe }: PushNotificationManagerProps) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [error, setError] = useState<string | null>(null)

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
      onSubscribe()
      setIsSubscribed(true)
      setError(null)
    }
    catch (err) {
      setError('订阅推送通知失败，请确保已授予通知权限')
      console.error('推送通知订阅错误:', err)
    }
  }

  const unsubscribe = async () => {
    try {
      if (!registration)
        return

      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        await unsubscribeUser(subscription.endpoint)
        onUnsubscribe()
        setIsSubscribed(false)
        setError(null)
      }
    }
    catch (err) {
      setError('取消订阅失败')
      console.error('取消订阅错误:', err)
    }
  }

  if (!registration || !('Notification' in window)) {
    return (
      <div className="text-gray-400 text-sm">
        您的浏览器不支持推送通知功能
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={isSubscribed ? unsubscribe : subscribe}
        className={cn(
          'w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors',
          isSubscribed
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-green-600 hover:bg-green-700',
        )}
      >
        {isSubscribed ? '取消推送通知' : '开启推送通知'}
      </button>
    </div>
  )
}
