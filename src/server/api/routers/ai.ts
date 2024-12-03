import { env } from '@/env'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { z } from 'zod'

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

export const aiRouter = createTRPCRouter({
  generateContent: publicProcedure
    .input(
      z.object({
        text: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: input.text }],
          }],
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Gemini API error: ${error}`)
      }

      const data = await response.json()
      return data
    }),
})
