'use client'

import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export interface ModalProps {
  isOpen: boolean
  onCloseAction: () => void
  children: ReactNode
  title?: string
  className?: string
}

export function Modal({
  isOpen,
  onCloseAction,
  children,
  title,
  className,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onCloseAction()}>
      <DialogContent className={cn('max-w-2xl max-h-[90vh] overflow-y-auto', className)}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  )
}
