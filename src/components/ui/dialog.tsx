'use client'

import { cn } from '@/utils'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface DialogProps {
  isOpen: boolean
  onCloseAction: () => void
  children: React.ReactNode
  className?: string
}

export function Dialog({ isOpen, onCloseAction, children, className }: DialogProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

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

  if (!mounted) {
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
