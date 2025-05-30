import { PrismaClient } from '@prisma/client'

import { env } from '@/env'

function createPrismaClient() {
  return new PrismaClient(
    {
      log:
      env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      omit: {
        moment: {
          content_vector: false,
        },
        keep: {
          content_vector: false,
          summary_vector: false,
          title_vector: false,
        },
        image: {
          description_vector: false,
        },
      },
    },
  )
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (env.NODE_ENV !== 'production')
  globalForPrisma.prisma = db
