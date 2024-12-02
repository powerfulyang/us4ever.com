import {
  createTRPCRouter,
  publicProcedure,
} from '@/server/api/trpc'

import { z } from 'zod'

export const assetRouter = createTRPCRouter({
  compress: publicProcedure
    .input(z.object({
      file: z.instanceof(File),
    }))
    .query(({ input }) => {
      return {
        input,
      }
    }),
})
