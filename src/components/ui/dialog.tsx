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
    const modalElement = modalRef.current
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseAction()
      }
    }

    const handleWheel = (e: WheelEvent) => {
      if (!modalElement)
        return

      const { scrollTop, scrollHeight, clientHeight } = modalElement
      const isScrolledToTop = scrollTop === 0
      const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight

      if (
        (isScrolledToTop && e.deltaY < 0)
        || (isScrolledToBottom && e.deltaY > 0)
      ) {
        e.preventDefault()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      modalElement?.addEventListener('wheel', handleWheel, { passive: false })
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
      modalElement?.removeEventListener('wheel', handleWheel)
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
