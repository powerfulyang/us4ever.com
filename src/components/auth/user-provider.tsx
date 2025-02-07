'use client'

import { useIsomorphicLayoutEffect } from 'framer-motion'

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
