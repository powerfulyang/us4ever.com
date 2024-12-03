import { type AppRouter, createCaller } from '@/server/api/root'

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
  const _cookies = await cookies()

  return createTRPCContext({
    headers: _headers,
    cookies: _cookies,
  })
})

const getQueryClient = cache(createQueryClient)
const caller = createCaller(createContext)

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
)
