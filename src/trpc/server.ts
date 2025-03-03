import type { AppRouter } from '@/server/api/root'

import type { RequestCookies } from 'next/dist/server/web/spec-extension/cookies'
import { createCaller } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'
import { createHydrationHelpers } from '@trpc/react-query/rsc'
import { cookies, headers } from 'next/headers'

import { cache } from 'react'
import { createQueryClient } from './query-client'
import 'server-only'

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const _headers = await headers()
  /**
   * `cookies` is an **async** function that allows you to read the HTTP incoming request cookies in [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components), and read/write outgoing request cookies in [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) or [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers).
   */
  const _cookies = await cookies()

  return createTRPCContext({
    headers: _headers,
    cookies: _cookies as unknown as RequestCookies,
  })
})

const getQueryClient = cache(createQueryClient)
const caller = createCaller(createContext)

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
)
