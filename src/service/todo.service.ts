import type { Prisma, Todo } from '@prisma/client'
import type { CreateTodoDTO, QueryTodoDTO, UpdateTodoDTO } from '@/dto/todo.dto'
import type { BaseListFilter } from '@/types/common'
import { createError } from '@/lib/error-handler'
import { db } from '@/server/db'
import { getCursor } from '@/service'

interface CreateTodoInput {
  title: string
  content?: string
  priority: number
  dueDate?: Date
  isPublic: boolean
  ownerId: string
}

interface UpdateTodoInput extends CreateTodoInput {
  id: string
}

interface FindTodosByCursorInput {
  userIds: string[]
  limit: number
  cursor?: string
}

export async function listTodos({ userId }: BaseListFilter) {
  return db.todo.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { isPublic: true },
      ],
    },
    orderBy: [
      { pinned: 'desc' },
      { createdAt: 'desc' },
    ],
  })
}

export async function findTodosByCursor({ userIds, limit, cursor }: FindTodosByCursorInput) {
  const items = await db.todo.findMany({
    take: limit + 1, // 获取多一条用于判断是否有下一页
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
    cursor: getCursor(cursor),
    orderBy: [
      {
        pinned: 'desc',
      },
      {
        status: 'asc',
      },
      {
        createdAt: 'desc',
      },
    ],
  })

  let nextCursor: typeof cursor | undefined
  if (items.length > limit) {
    const nextItem = items.pop()
    nextCursor = nextItem!.id
  }
  return {
    items,
    nextCursor,
  }
}

export async function createTodo(input: CreateTodoInput) {
  return db.todo.create({
    data: input,
  })
}

export async function updateTodo(input: UpdateTodoInput) {
  const { id, ...data } = input
  return db.todo.update({
    where: {
      id,
      ownerId: input.ownerId,
    },
    data,
  })
}

export async function deleteTodo(id: string, ownerId: string) {
  return db.todo.delete({
    where: {
      id,
      ownerId,
    },
  })
}

export async function toggleTodoStatus(id: string, ownerId: string, status: boolean) {
  return db.todo.update({
    where: {
      id,
      ownerId,
    },
    data: { status },
  })
}

export async function toggleTodoPublic(id: string, ownerId: string, isPublic: boolean) {
  return db.todo.update({
    where: {
      id,
      ownerId,
    },
    data: { isPublic },
  })
}

export async function toggleTodoPin(id: string, ownerId: string, pinned: boolean) {
  return db.todo.update({
    where: {
      id,
      ownerId,
    },
    data: { pinned },
  })
}

// 查询用户的待办事项列表
async function findUserTodos(userId: string, query: QueryTodoDTO) {
  const { status, priority, pinned, category, limit, offset } = query

  const where: Prisma.TodoWhereInput = {
    ownerId: userId,
  }

  if (status !== undefined)
    where.status = status
  if (priority !== undefined)
    where.priority = priority
  if (pinned !== undefined)
    where.pinned = pinned
  if (category)
    where.category = category

  const [items, total] = await Promise.all([
    db.todo.findMany({
      where,
      orderBy: [
        { pinned: 'desc' },
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
    }),
    db.todo.count({ where }),
  ])

  return {
    items,
    total,
    hasMore: offset + items.length < total,
  }
}

async function findById(id: string, userId: string): Promise<Todo | null> {
  return db.todo.findUnique({
    where: { id, ownerId: userId },
  })
}

async function create(data: CreateTodoDTO, userId: string): Promise<Todo> {
  return db.todo.create({
    data: {
      ...data,
      ownerId: userId,
    },
  })
}

async function update(id: string, data: UpdateTodoDTO, userId: string): Promise<Todo> {
  return db.todo.update({
    where: { id, ownerId: userId },
    data,
  })
}

async function remove(id: string, userId: string): Promise<void> {
  await db.todo.delete({
    where: { id, ownerId: userId },
  })
}

// 切换待办事项状态
async function toggleStatus(id: string, userId: string): Promise<Todo> {
  const todo = await findById(id, userId)
  if (!todo) {
    throw createError.notFound('待办事项')
  }

  return update(id, { status: !todo.status }, userId)
}

// 置顶/取消置顶
async function togglePin(id: string, userId: string): Promise<Todo> {
  const todo = await findById(id, userId)
  if (!todo) {
    throw createError.notFound('待办事项')
  }

  return update(id, { pinned: !todo.pinned }, userId)
}

// 统计信息
async function getStats(userId: string) {
  const [total, completed, pending, overdue] = await Promise.all([
    db.todo.count({ where: { ownerId: userId } }),
    db.todo.count({ where: { ownerId: userId, status: true } }),
    db.todo.count({ where: { ownerId: userId, status: false } }),
    db.todo.count({
      where: {
        ownerId: userId,
        status: false,
        dueDate: {
          lt: new Date(),
        },
      },
    }),
  ])

  return {
    total,
    completed,
    pending,
    overdue,
  }
}

export const todoService = {
  create,
  update,
  delete: remove,
  findById,
  findUserTodos,
  findTodosByCursor,
  toggleStatus,
  togglePin,
  getStats,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoStatus,
  toggleTodoPublic,
  toggleTodoPin,
}
