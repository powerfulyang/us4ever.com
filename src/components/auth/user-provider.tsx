'use client'

import { useEffect } from 'react'

interface Props {
  user: User | null | undefined
}

export function UserProvider({ user }: Props) {
  const { setCurrentUser } = useUserStore()

  useEffect(() => {
    setCurrentUser(user)
  }, [user, setCurrentUser])

  return null
}
