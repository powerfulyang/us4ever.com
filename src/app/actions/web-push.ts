'use server'

import type { WebPushSubscription } from '@/types/push'
import webpush from 'web-push'
import { db } from '@/server/db'

webpush.setVapidDetails(
  'mailto:hutyxxx@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function subscribeUser(sub: WebPushSubscription) {
  try {
    await db.pushSubscription.create({
      data: {
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
      },
    })
    return { success: true }
  }
  catch (error) {
    console.error('订阅失败:', error)
    return { success: false, error: '订阅失败' }
  }
}

export async function unsubscribeUser(endpoint: string) {
  try {
    await db.pushSubscription.delete({
      where: { endpoint },
    })
    return { success: true }
  }
  catch (error) {
    console.error('取消订阅失败:', error)
    return { success: false, error: '取消订阅失败' }
  }
}

export async function sendNotification(message: string) {
  try {
    const subscriptions = await db.pushSubscription.findMany()

    const notifications = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify({
            title: '通知测试',
            body: message,
            icon: '/icons/icon-192x192.png',
          }),
        )
      }
      catch (error) {
        console.error(`发送通知失败 (${sub.endpoint}):`, error)
        // 如果是订阅过期，删除该订阅
        if ((error as any).statusCode === 410) {
          await db.pushSubscription.delete({
            where: { endpoint: sub.endpoint },
          })
        }
      }
    })

    await Promise.all(notifications)
    return { success: true }
  }
  catch (error) {
    console.error('发送通知失败:', error)
    return { success: false, error: '发送通知失败' }
  }
}
