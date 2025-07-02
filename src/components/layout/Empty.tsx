'use client'

import { motion } from 'framer-motion'
import { FileX2 } from 'lucide-react'

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
      <FileX2 className="w-10 h-10 text-gray-300" />

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
    </motion.div>
  )
}
