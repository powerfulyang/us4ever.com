import { summaryTitle } from '@/lib/gemini'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { z } from 'zod'

export const aiRouter = createTRPCRouter({
  generateContent: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      return await summaryTitle(input.text)
    }),
})
