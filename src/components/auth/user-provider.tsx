'use client'

import { api } from '@/trpc/react'
import { useEffect } from 'react'

export function UserProvider() {
  const { data: currentUser, isPending } = api.user.current.useQuery()
  const { setCurrentUser, setIsPending } = useUserStore()

  useEffect(() => {
    setCurrentUser(currentUser)
  }, [currentUser, setCurrentUser])

  useEffect(() => {
    setIsPending(isPending)
  }, [isPending, setIsPending])

  return null
}
