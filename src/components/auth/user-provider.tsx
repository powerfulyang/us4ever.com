'use client'

import type { User } from '@/store/user'
import { useEffect } from 'react'
import { useUserStore } from '@/store/user'
import { api } from '@/trpc/react'

interface Props {
  user: User | null | undefined
}

export function UserProvider({ user }: Props) {
  const { setCurrentUser, setIsPending } = useUserStore()
  const shouldFetchUser = user === undefined

  const { data, isLoading } = api.user.current.useQuery(undefined, {
    enabled: shouldFetchUser,
    staleTime: 60 * 1000,
    retry: 1,
  })

  useEffect(() => {
    if (!shouldFetchUser) {
      setCurrentUser(user)
      return
    }

    setIsPending(isLoading)

    if (!isLoading) {
      setCurrentUser(data ?? null)
    }
  }, [data, isLoading, setCurrentUser, setIsPending, shouldFetchUser, user])

  return null
}
