import { z } from 'zod'
import { BasePageQuerySchema, BaseQuerySchema } from '@/dto/base.dto'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { logger } from '@/server/logger'
import { todoService } from '@/service/todo.service'

export type Todo = Awaited<ReturnType<typeof todoService.findTodosByCursor>>['items'][number]

export const todoRouter = createTRPCRouter({
  fetchByCursor: publicProcedure.input(BaseQuerySchema).query(
    async ({ ctx, input }) => {
      const limit = input.limit
      const cursor = input.cursor
      const userIds = ctx.groupUserIds
      logger.todo.info('Fetching todos by cursor', { cursor, limit })
      const result = await todoService.findTodosByCursor({ userIds, limit, cursor })
      logger.todo.info(`Found ${result.items.length} todos`)
      return result
    },
  ),

  fetchByPage: publicProcedure.input(BasePageQuerySchema).query(
    async ({ ctx, input }) => {
      const { page, pageSize } = input
      const userIds = ctx.groupUserIds
      logger.todo.info('Fetching todos by page', { page, pageSize })
      const result = await todoService.findTodosByPage({ userIds, page, pageSize })
      logger.todo.info(`Found ${result.items.length} todos`, { total: result.total })
      return result
    },
  ),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().optional(),
        priority: z.number().min(0).default(0),
        dueDate: z.date().optional(),
        isPublic: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.todo.info('Creating new todo', { title: input.title, ownerId: ctx.user.id })
      const result = await todoService.createTodo({
        ...input,
        ownerId: ctx.user.id,
      })
      logger.todo.info('Todo created successfully', { id: result.id })
      return result
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        content: z.string().optional(),
        priority: z.number().min(0),
        dueDate: z.date().optional(),
        isPublic: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      logger.todo.info('Updating todo', { id, title: data.title })
      const result = await todoService.updateTodo({
        id,
        ...data,
        ownerId: ctx.user.id,
      })
      logger.todo.info('Todo updated successfully', { id })
      return result
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      logger.todo.info('Deleting todo', { id: input.id, userId: ctx.user.id })
      await todoService.deleteTodo(input.id, ctx.user.id)
      logger.todo.info('Todo deleted successfully', { id: input.id })
      return { id: input.id }
    }),

  toggleStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.todo.info('Toggling todo status', { id: input.id, status: input.status })
      const result = await todoService.toggleTodoStatus(input.id, ctx.user.id, input.status)
      logger.todo.info('Todo status updated', { id: input.id, status: result.status })
      return result
    }),

  togglePublic: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isPublic: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.todo.info('Toggling todo visibility', { id: input.id, isPublic: input.isPublic })
      const result = await todoService.toggleTodoPublic(input.id, ctx.user.id, input.isPublic)
      logger.todo.info('Todo visibility updated', { id: input.id, isPublic: result.isPublic })
      return result
    }),

  togglePin: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        pinned: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.todo.info('Toggling todo pin', { id: input.id, pinned: input.pinned })
      const result = await todoService.toggleTodoPin(input.id, ctx.user.id, input.pinned)
      logger.todo.info('Todo pin updated', { id: input.id, pinned: result.pinned })
      return result
    }),
})
