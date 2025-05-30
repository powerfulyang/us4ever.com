'use client'

import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useMountedState } from 'react-use'
import { cn } from '@/utils'

interface DialogProps {
  isOpen: boolean
  onCloseAction: () => void
  children: React.ReactNode
  className?: string
}

export function Dialog({ isOpen, onCloseAction, children, className }: DialogProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const isMounted = useMountedState()

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseAction()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onCloseAction])

  if (!isMounted()) {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div ref={modalRef} className={cn('fixed inset-0 z-50 flex items-center justify-center', className)}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute inset-0 bg-black/60 backdrop-blur-sm',
            )}
            onClick={onCloseAction}
          />
          {children}
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
