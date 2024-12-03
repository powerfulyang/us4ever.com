import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { z } from 'zod'

export const todoRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.todo.findMany({
      where: {
        OR: [
          {
            ownerId: ctx.user?.id,
          },
          {
            isPublic: true,
          },
        ],
      },
      orderBy: [
        {
          pinned: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    })
  }),

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
      return ctx.db.todo.create({
        data: {
          ...input,
          ownerId: ctx.user.id,
        },
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
      const { id, ...data } = input
      return ctx.db.todo.update({
        where: {
          id,
          ownerId: ctx.user.id,
        },
        data,
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.todo.delete({
        where: {
          id: input.id,
          ownerId: ctx.user.id,
        },
      })
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
      return ctx.db.todo.update({
        where: {
          id: input.id,
          ownerId: ctx.user.id,
        },
        data: {
          status: input.status,
        },
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
      return ctx.db.todo.update({
        where: {
          id: input.id,
          ownerId: ctx.user.id,
        },
        data: {
          isPublic: input.isPublic,
        },
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
      return ctx.db.todo.update({
        where: {
          id: input.id,
          ownerId: ctx.user.id,
        },
        data: {
          pinned: input.pinned,
        },
      })
    }),
})
