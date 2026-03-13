'use server'

import type { WebPushSubscription } from '@/types/push'
import { verify } from 'hono/jwt'
import { cookies } from 'next/headers'
import webpush from 'web-push'
import { env } from '@/env'
import { db } from '@/server/db'
import { COOKIE_NAME } from '@/server/hono'

webpush.setVapidDetails(
  'mailto:hutyxxx@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

/**
 * 从 cookie 中获取当前用户信息
 */
async function getCurrentUser() {
  const c = await cookies()
  const token = c.get(COOKIE_NAME)?.value
  if (!token)
    return null

  try {
    const res = await verify(token, env.JWT_SECRET, 'HS256') as { user: { id: string } }
    return res.user
  }
  catch {
    return null
  }
}

export async function subscribeUser(sub: WebPushSubscription) {
  try {
    const user = await getCurrentUser()

    await db.pushSubscription.create({
      data: {
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        userId: user?.id, // 关联当前用户
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
    const user = await getCurrentUser()

    // 如果有用户信息，只能删除自己的订阅；如果没有，按 endpoint 删除
    if (user) {
      await db.pushSubscription.deleteMany({
        where: {
          endpoint,
          userId: user.id,
        },
      })
    }
    else {
      await db.pushSubscription.delete({
        where: { endpoint },
      })
    }
    return { success: true }
  }
  catch (error) {
    console.error('取消订阅失败:', error)
    return { success: false, error: '取消订阅失败' }
  }
}

export async function sendNotification(message: string, targetUserIds?: string[]) {
  try {
    // 如果指定了目标用户，只发送给这些用户；否则发送给所有订阅
    const whereClause = targetUserIds && targetUserIds.length > 0
      ? { userId: { in: targetUserIds } }
      : {}

    const subscriptions = await db.pushSubscription.findMany({
      where: whereClause,
    })

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
    return { success: true, count: subscriptions.length }
  }
  catch (error) {
    console.error('发送通知失败:', error)
    return { success: false, error: '发送通知失败' }
  }
}

/**
 * 获取当前用户的所有推送订阅
 */
export async function getMySubscriptions() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '未登录' }
    }

    const subscriptions = await db.pushSubscription.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        endpoint: true,
        createdAt: true,
      },
    })

    return { success: true, subscriptions }
  }
  catch (error) {
    console.error('获取订阅失败:', error)
    return { success: false, error: '获取订阅失败' }
  }
}

/**
 * 获取所有可推送的用户列表
 */
export async function getPushUsers() {
  try {
    // 获取有推送订阅的用户ID列表
    const userIds = await db.pushSubscription.findMany({
      where: { userId: { not: null } },
      select: { userId: true },
      distinct: ['userId'],
    })

    // 获取用户详细信息
    const users = await db.user.findMany({
      where: { id: { in: userIds.map(u => u.userId!).filter(Boolean) } },
      select: {
        id: true,
        nickname: true,
        email: true,
      },
    })

    // 获取每个用户的订阅数量
    const subscriptionCounts = await db.pushSubscription.groupBy({
      by: ['userId'],
      where: { userId: { not: null } },
      _count: { userId: true },
    })

    return {
      success: true,
      users: users.map(user => ({
        id: user.id,
        name: user.nickname,
        email: user.email,
        subscriptionCount: subscriptionCounts.find(
          sc => sc.userId === user.id,
        )?._count.userId || 0,
      })),
    }
  }
  catch (error) {
    console.error('获取用户列表失败:', error)
    return { success: false, error: '获取用户列表失败' }
  }
}
