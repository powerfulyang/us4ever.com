import { z } from 'zod'
import { BaseQuerySchema } from '@/dto/base.dto'
import { PerformanceMonitor } from '@/lib/monitoring'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { todoService } from '@/service/todo.service'

export const todoRouter = createTRPCRouter({
  fetchByCursor: publicProcedure.input(BaseQuerySchema).query(
    async ({ ctx, input }) => {
      return PerformanceMonitor.measureAsync('todo.fetchByCursor', async () => {
        const limit = input.limit
        const cursor = input.cursor
        const userIds = ctx.groupUserIds
        return todoService.findTodosByCursor({ userIds, limit, cursor })
      })
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
      return PerformanceMonitor.measureAsync('todo.create', async () => {
        return todoService.createTodo({
          ...input,
          ownerId: ctx.user.id,
        })
      })
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
      return PerformanceMonitor.measureAsync('todo.update', async () => {
        const { id, ...data } = input
        return todoService.updateTodo({
          id,
          ...data,
          ownerId: ctx.user.id,
        })
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return PerformanceMonitor.measureAsync('todo.delete', async () => {
        await todoService.deleteTodo(input.id, ctx.user.id)
        return { id: input.id }
      })
    }),

  toggleStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return PerformanceMonitor.measureAsync('todo.toggleStatus', async () => {
        return todoService.toggleTodoStatus(input.id, ctx.user.id, input.status)
      })
    }),

  togglePublic: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isPublic: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return PerformanceMonitor.measureAsync('todo.togglePublic', async () => {
        return todoService.toggleTodoPublic(input.id, ctx.user.id, input.isPublic)
      })
    }),

  togglePin: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        pinned: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return PerformanceMonitor.measureAsync('todo.togglePin', async () => {
        return todoService.toggleTodoPin(input.id, ctx.user.id, input.pinned)
      })
    }),
})
