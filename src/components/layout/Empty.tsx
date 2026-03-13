'use client'

import { motion } from 'framer-motion'
import { FileQuestion } from 'lucide-react'

interface EmptyProps {
  title?: string
  description?: string
}

export function Empty({ title = '暂无数据', description }: EmptyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center gap-4 py-8"
    >
      <div className="rounded-full bg-muted p-6">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </motion.div>
  )
}
