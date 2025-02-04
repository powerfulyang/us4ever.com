import type { BaseListFilter } from '@/types/common'
import { db } from '@/server/db'

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
