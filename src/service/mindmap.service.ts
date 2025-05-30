import type { BaseListFilter } from '@/types/common'
import { HTTPException } from 'hono/http-exception'
import { db } from '@/server/db'

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

export async function incrementMindMapViews(id: string) {
  return db.mindMap.update({
    where: { id },
    data: { views: { increment: 1 } },
  })
}

export async function createMindMap(input: CreateMindMapInput) {
  return db.mindMap.create({
    data: input,
  })
}

export async function updateMindMap(input: UpdateMindMapInput) {
  return db.mindMap.update({
    where: {
      id: input.id,
      ownerId: input.ownerId,
    },
    data: input,
  })
}

export async function deleteMindMap(id: string, ownerId: string) {
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
}
