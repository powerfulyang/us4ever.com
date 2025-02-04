import type { BaseListFilter, BaseUpdateInput } from '@/types/common'
import { db } from '@/server/db'
import { HTTPException } from 'hono/http-exception'

interface CreateKeepInput {
  content: string
  isPublic?: boolean
  ownerId: string
}

interface UpdateKeepInput extends BaseUpdateInput {
  content: string
  isPublic: boolean
  ownerId: string
}

export async function listKeeps({ userId }: BaseListFilter) {
  return db.keep.findMany({
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

export async function createKeep(input: CreateKeepInput) {
  return db.keep.create({
    data: {
      content: input.content,
      isPublic: input.isPublic ?? false,
      ownerId: input.ownerId,
    },
  })
}

export async function updateKeep(input: UpdateKeepInput) {
  return db.keep.update({
    where: {
      id: input.id,
      ownerId: input.ownerId,
    },
    data: {
      content: input.content,
      isPublic: input.isPublic,
      title: '',
      summary: '',
    },
  })
}

export async function getKeepById(id: string, { userId }: BaseListFilter) {
  const keep = await db.keep.findUnique({
    where: {
      id,
      OR: [
        { ownerId: userId },
        { isPublic: true },
      ],
    },
  })

  if (!keep) {
    throw new HTTPException(404, { message: 'Keep not found' })
  }

  return keep
}

export async function incrementKeepViews(id: string) {
  return db.keep.update({
    where: { id },
    data: { views: { increment: 1 } },
  })
}

export async function deleteKeep(id: string, ownerId: string) {
  return db.keep.delete({
    where: {
      id,
      ownerId,
    },
  })
}
