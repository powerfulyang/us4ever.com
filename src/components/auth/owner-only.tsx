'use client'

import type { ReactElement, ReactNode } from 'react'
import { useUserStore } from '@/store/user'
import { createElement, isValidElement } from 'react'

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

export function AuthenticatedOnly({
  children,
  disableChildren = false,
}: { children: ReactElement<Record<string, any>>, disableChildren?: boolean }) {
  const { isAuthenticated } = useUserStore()

  if (!isAuthenticated) {
    if (disableChildren) {
      return isValidElement(children)
        ? createElement(children.type, { ...children.props, title: '请先登录', disabled: true })
        : children
    }
    return null
  }

  return children
}
