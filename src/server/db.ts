import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import pg from 'pg'
import { env } from '@/env'
import { logger } from '@/server/logger'

// 密码掩码正则表达式
const PASSWORD_REGEX = /:[^:@]+@/

function createPrismaClient() {
  logger.db.startup('Initializing PostgreSQL connection pool...')

  const pool = new pg.Pool({ connectionString: env.DATABASE_URL })
  const adapter = new PrismaPg(pool)

  logger.db.config('Database URL', env.DATABASE_URL?.replace(PASSWORD_REGEX, ':****@'))

  return new PrismaClient(
    {
      adapter,
      log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    },
  )
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (env.NODE_ENV !== 'production')
  globalForPrisma.prisma = db

logger.db.startup('Prisma client initialized successfully ✅')
