'use client'

import type { MouseEvent, ReactElement, ReactNode } from 'react'
import { createElement, isValidElement } from 'react'
import { toast } from 'react-toastify'
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

export function AuthenticatedOnly({
  children,
  disableChildren = false,
}: { children: ReactElement<Record<string, any>>, disableChildren?: boolean }) {
  const { isAuthenticated } = useUserStore()

  if (!isAuthenticated) {
    if (disableChildren) {
      return isValidElement(children)
        ? createElement(children.type, {
            ...children.props,
            onClickCapture: (e: MouseEvent) => {
              e.preventDefault()
              e.stopPropagation()
              toast.warn('请先登录')
            },
          })
        : children
    }
    return null
  }

  return children
}
