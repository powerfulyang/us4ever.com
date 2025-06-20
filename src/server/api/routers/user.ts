import { PerformanceMonitor } from '@/lib/monitoring'
import {
  createTRPCRouter,
  publicProcedure,
} from '@/server/api/trpc'

export const userRouter = createTRPCRouter({
  current: publicProcedure.query(
    async ({ ctx }) => {
      return PerformanceMonitor.measureAsync('user.current', async () => {
        return ctx.user
      })
    },
  ),
})
