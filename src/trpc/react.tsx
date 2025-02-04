'use client'

import type { AppRouter } from '@/server/api/root'
import type { QueryClient } from '@tanstack/react-query'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import type { ReactNode } from 'react'
import { errorToastLink } from '@/trpc/errorToastLink'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  loggerLink,
  splitLink,
} from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { defaultTransformer } from '@trpc/server/unstable-core-do-not-import'
import { useState } from 'react'
import SuperJSON from 'superjson'

import { createQueryClient } from './query-client'

let clientQueryClientSingleton: QueryClient | undefined
function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient()
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= createQueryClient())
}

// eslint-disable-next-line react-refresh/only-export-components
export const api = createTRPCReact<AppRouter>()
const Provider = api.Provider

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>

export function TRPCReactProvider(props: { children: ReactNode }) {
  const queryClient = getQueryClient()

  const [trpcClient] = useState(() => {
    const url = `${getBaseUrl()}/api/trpc`
    return api.createClient({
      links: [
        errorToastLink,
        loggerLink({
          enabled: op =>
            process.env.NODE_ENV === 'development'
            || (op.direction === 'down' && op.result instanceof Error),
        }),
        splitLink({
          condition: op => isNonJsonSerializable(op.input),
          true: httpLink({
            transformer: {
              input: defaultTransformer.input,
              output: SuperJSON,
            },
            url,
          }),
          false: httpBatchLink({
            transformer: SuperJSON,
            url,
          }),
        }),
      ],
    })
  })

  const { children } = props

  return (
    <QueryClientProvider client={queryClient}>
      <Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </Provider>
    </QueryClientProvider>
  )
}

function getBaseUrl() {
  if (typeof window !== 'undefined')
    return window.location.origin
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}
