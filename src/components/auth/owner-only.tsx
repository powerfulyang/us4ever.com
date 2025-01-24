'use client'

import type { ReactNode } from 'react'
import { useUserStore } from '@/store/user'

interface OwnerOnlyProps {
  ownerId: string | undefined
  children: ReactNode
}

export function OwnerOnly(
  { ownerId, children }: OwnerOnlyProps,
) {
  const currentUser = useUserStore(state => state.currentUser)
  const isOwner = currentUser?.id === ownerId

  if (!isOwner)
    return null
  return children
}

export function AuthenticatedOnly({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useUserStore()

  if (!isAuthenticated)
    return null
  return children
}
