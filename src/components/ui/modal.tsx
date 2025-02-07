'use client'

import type { ReactNode } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { cn } from '@/utils'
import { motion } from 'framer-motion'

interface ModalProps {
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
    <Dialog isOpen={isOpen} onCloseAction={onCloseAction}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'relative w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4',
          'bg-white/10 backdrop-blur-lg rounded-xl border border-white/20',
          className,
        )}
      >
        <div className="flex text-gray-300 items-center justify-between p-4 border-b border-white/10">
          {title && (
            <h3 className="text-lg font-medium">{title}</h3>
          )}
          <button
            type="button"
            onClick={onCloseAction}
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
    </Dialog>
  )
}
