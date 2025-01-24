'use client'

import type { ReactNode } from 'react'
import { cn } from '@/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleWheel = (e: WheelEvent) => {
      const modalElement = modalRef.current
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
      modalRef.current?.addEventListener('wheel', handleWheel, { passive: false })
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
      modalRef.current?.removeEventListener('wheel', handleWheel)
    }
  }, [isOpen, onClose])

  if (!mounted) {
    return null
  }

  return (
    createPortal(
      <AnimatePresence>
        {isOpen && (
          <div ref={modalRef} className="fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'absolute inset-0 bg-black/60 backdrop-blur-sm',
              )}
              onClick={onClose}
            />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'relative w-full max-w-2xl max-h-[90vh] overflow-y-auto',
                  'bg-white/10 backdrop-blur-lg rounded-xl border border-white/20',
                )}
              >
                <div className="flex text-gray-300 items-center justify-between p-4 border-b border-white/10">
                  {title && (
                    <h3 className="text-lg font-medium">{title}</h3>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  {children}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>,
      document.body,
    )
  )
}
