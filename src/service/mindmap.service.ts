import type { BaseListFilter } from '@/types/common'
import { HTTPException } from 'hono/http-exception'
import { PerformanceMonitor } from '@/lib/monitoring'
import { db } from '@/server/db'
import { getCursor } from '@/service'

interface CreateMindMapInput {
  title?: string
  content: Record<string, any>
  isPublic: boolean
  ownerId: string
}

interface UpdateMindMapInput {
  id: string
  isPublic: boolean
  title: string
  content: Record<string, any>
  ownerId: string
}

interface FindMindMapsByCursorInput {
  userIds: string[]
  take: number
  cursor?: string
}

export async function listMindMaps({ userId }: BaseListFilter) {
  return db.mindMap.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { isPublic: true },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function findMindMapsByCursor({ userIds, take, cursor }: FindMindMapsByCursorInput) {
  return PerformanceMonitor.measureAsync('mindMap.findMindMapsByCursor', async () => {
    const items = await db.mindMap.findMany({
      where: {
        OR: [
          {
            ownerId: {
              in: userIds,
            },
          },
          {
            isPublic: true,
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: take + 1,
      cursor: getCursor(cursor),
    })

    let nextCursor: typeof cursor | undefined
    if (items.length > take) {
      const nextItem = items.pop()
      nextCursor = nextItem!.id
    }

    return {
      items,
      nextCursor,
    }
  })
}

export async function getMindMapById(id: string, { userId }: BaseListFilter) {
  const mindmap = await db.mindMap.findUnique({
    where: {
      id,
      OR: [
        { ownerId: userId },
        { isPublic: true },
      ],
    },
  })

  if (!mindmap) {
    throw new HTTPException(404, { message: 'Mind map not found' })
  }

  const editable = mindmap.ownerId === userId

  return {
    ...mindmap,
    editable,
  }
}

export async function findMindMapById(id: string, userIds: string[], updateViews: boolean = false) {
  return PerformanceMonitor.measureAsync('mindMap.findMindMapById', async () => {
    const mindMap = await db.mindMap.findUnique({
      where: {
        id,
        OR: [
          {
            ownerId: {
              in: userIds,
            },
          },
          {
            isPublic: true,
          },
        ],
      },
    })

    if (!mindMap) {
      throw new HTTPException(404, {
        message: 'mind map not found',
      })
    }

    // Only increment views if not the owner
    if (updateViews && !userIds.includes(mindMap.ownerId)) {
      // 更新浏览次数
      await incrementMindMapViews(mindMap.id)
    }
    const editable = userIds.includes(mindMap.ownerId)

    return {
      ...mindMap,
      editable,
    }
  })
}

export async function incrementMindMapViews(id: string) {
  return db.mindMap.update({
    where: { id },
    data: { views: { increment: 1 } },
  })
}

export async function createMindMap(input: CreateMindMapInput) {
  return PerformanceMonitor.measureAsync('mindMap.createMindMap', async () => {
    return db.mindMap.create({
      data: input,
    })
  })
}

export async function updateMindMap(input: UpdateMindMapInput) {
  return PerformanceMonitor.measureAsync('mindMap.updateMindMap', async () => {
    return db.mindMap.update({
      where: {
        id: input.id,
        ownerId: input.ownerId,
      },
      data: input,
    })
  })
}

export async function deleteMindMap(id: string, ownerId: string) {
  return PerformanceMonitor.measureAsync('mindMap.deleteMindMap', async () => {
    const mindmap = await db.mindMap.findUnique({
      where: {
        id,
        ownerId,
      },
    })

    if (!mindmap) {
      throw new HTTPException(404, { message: 'Mind map not found' })
    }

    return db.mindMap.delete({
      where: { id },
    })
  })
}

export const mindMapService = {
  listMindMaps,
  findMindMapsByCursor,
  getMindMapById,
  findMindMapById,
  incrementMindMapViews,
  createMindMap,
  updateMindMap,
  deleteMindMap,
}
