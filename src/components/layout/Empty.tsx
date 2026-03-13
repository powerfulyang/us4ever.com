'use client'

import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

interface EmptyProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function Empty({
  title = '暂无数据',
  description,
  icon,
  action,
  className,
}: EmptyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex flex-col items-center justify-center text-center gap-6 py-16 px-6 rounded-3xl',
        'border border-muted/20 bg-muted/5 backdrop-blur-[2px]',
        className,
      )}
    >
      <div className="relative group flex items-center justify-center">
        {/* Decorative Background Blob */}
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full transition-all duration-700 group-hover:bg-primary/10 group-hover:scale-125" />

        {/* Outer Ring */}
        <div className="absolute -inset-2 rounded-full border border-primary/5 transition-all duration-700 group-hover:scale-110 group-hover:border-primary/10" />

        <motion.div
          animate={{
            y: [0, -6, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative z-10 flex items-center justify-center w-20 h-20 rounded-2xl bg-background border border-muted/50 shadow-xl shadow-primary/5 transition-all duration-500 group-hover:border-primary/40 group-hover:rotate-3 group-hover:scale-105"
        >
          {icon || (
            <Inbox className="h-10 w-10 text-muted-foreground/60 transition-colors duration-500 group-hover:text-primary/70" />
          )}
        </motion.div>
      </div>

      <div className="space-y-2 max-w-[320px]">
        <h3 className="text-xl font-bold tracking-tight text-foreground/90">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground/80 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  )
}
