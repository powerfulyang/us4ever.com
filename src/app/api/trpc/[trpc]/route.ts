import type { NextRequest } from 'next/server'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

import { env } from '@/env'
import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'

// import '@/corn'

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
async function createContext(req: NextRequest) {
  return createTRPCContext({
    headers: req.headers,
    cookies: req.cookies,
  })
}

function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
            )
            if (error.cause instanceof Error) {
              console.error(error.cause)
            }
          }
        : undefined,
  })
}

export { handler as GET, handler as POST }
