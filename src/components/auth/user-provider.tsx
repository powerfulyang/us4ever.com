'use client'

import type { User } from '@/store/user'
import { useIsomorphicLayoutEffect } from 'framer-motion'
import { useUserStore } from '@/store/user'

interface Props {
  user: User | null | undefined
}

export function UserProvider({ user }: Props) {
  const { setCurrentUser } = useUserStore()

  useIsomorphicLayoutEffect(() => {
    setCurrentUser(user)
  }, [user, setCurrentUser])

  return null
}
