import type { TelegramMessage } from '@/lib/telegram'
import { get } from 'lodash-es'
import { bufferTime, catchError, concatMap, distinct, EMPTY, from, mergeMap, Subject, tap } from 'rxjs'
import { handleFile, sync_telegram } from '@/lib/telegram'
import { db } from '@/server/db'
import { protectedRoutes } from '@/server/hono'
import { createMoment } from '@/service/moment.service'

export interface TelegramSyncItem {
  value: TelegramMessage & { ownerId: string }
  force: boolean
  category: string
}

// 创建一个 Subject 来接收所有同步请求的数据
const telegramSync$ = new Subject<TelegramSyncItem>()

// 处理同步逻辑
const syncProcessor$ = telegramSync$.pipe(
  bufferTime(1000), // 缓冲 1 秒内的所有请求
  mergeMap(items => from(items)), // 展平数组
  distinct(item => item.value.id), // 确保消息 ID 唯一性
  concatMap(async (value) => {
    const { value: item, force, category } = value
    const content = item.message || ''
    let updatedAt
    if (item.updatedAt) {
      updatedAt = new Date(item.updatedAt * 1000)
    }
    const createdAt = new Date(item.createdAt * 1000)

    const exist = await db.moment.findFirst({
      where: {
        category,
        extraData: {
          path: ['id'],
          equals: item.id,
        },
      },
    })
    if (exist) {
      if (!force) {
        return 'Moment already exists'
      }
      await db.moment.update({
        where: {
          id: exist.id,
        },
        data: {
          content,
          updatedAt,
          createdAt,
        },
      })
      return 'Update moment'
    }

    const { imageList, videoList, needCreateMoment } = await handleFile(value)

    if (needCreateMoment) {
      await createMoment(
        {
          content,
          isPublic: true,
          category,
          extraData: {
            id: item.id,
            groupedId: item.groupedId,
          },
          images: imageList,
          videos: videoList,
          createdAt: new Date(item.createdAt * 1000),
          updatedAt,
        },
        item.ownerId,
      )
      return 'Create new moment'
    }
    else {
      return 'Grouped moment'
    }
  }),
  tap((result) => {
    console.log('Sync result:', result)
  }),
  catchError((error) => {
    console.error('Error processing telegram sync:', error)
    return EMPTY
  }),
)

export async function handleSyncTelegram(
  category: string,
  force: boolean,
  channel_name: string,
  userId: string,
) {
  if (!telegramSync$.observed) {
    // 启动处理器
    syncProcessor$.subscribe()
  }
  // 查询数据库中最新的 id
  const latestItem = await db.moment.findFirst({
    where: {
      category,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      extraData: true,
    },
  })
  let latestId = 0
  const itemId = get(latestItem, 'extraData.id')
  if (itemId) {
    latestId = Number(itemId)
  }
  if (force) {
    latestId = 0
  }

  // 循环调用 syncTelegram 直到没有新数据
  let allPosts: TelegramMessage[] = []
  let hasMoreData = true
  let currentLastId = 0
  const limit = 100

  while (hasMoreData) {
    const posts = await sync_telegram(
      currentLastId,
      limit,
      channel_name,
    )

    const filteredPosts = posts.filter((post) => {
      const id = post.id
      return id > latestId
    })

    // 更新 currentLastId 为最后一条消息的 id
    if (filteredPosts.length > 0) {
      currentLastId = Math.min(...filteredPosts.map(post => post.id))
    }
    else {
      currentLastId = currentLastId - limit
    }

    console.log('currentLastId', currentLastId, 'latestId', latestId)

    allPosts = [...allPosts, ...filteredPosts]

    if (currentLastId <= latestId) {
      hasMoreData = false
    }

    // 如果返回的数据量小于 limit，说明没有更多数据了
    // if (filteredPosts.length < limit) {
    //   hasMoreData = false
    // }
  }

  // 将新的同步数据推送到 Subject
  allPosts.forEach((post) => {
    telegramSync$.next({
      value: {
        ownerId: userId,
        ...post,
      },
      force,
      category,
    })
  })
  return allPosts
}

export function loadSyncTelegramRouter() {
  protectedRoutes.get('/telegram/:channel_name', async (ctx) => {
    const channel_name = ctx.req.param('channel_name')
    const category = `telegram:${channel_name}`

    const user = ctx.get('user')
    const force = ctx.req.query('force') !== undefined
    const allItems = await handleSyncTelegram(category, force, channel_name, user.id)

    return ctx.json({ success: true, count: allItems.length })
  })
}
