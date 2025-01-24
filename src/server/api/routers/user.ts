import { COOKIE_NAME } from '@/app/api/[[...route]]/route'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc'
import { NextResponse } from 'next/server'

export const userRouter = createTRPCRouter({
  current: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.user
    }),
  logout: protectedProcedure
    .mutation(async () => {
      const response = NextResponse.next()
      response.cookies.delete(COOKIE_NAME)
      return { success: true }
    }),
})
