import { Trash2 } from 'lucide-react'
import React from 'react'
import { OwnerOnly } from '@/components/auth/owner-only'
import { StatsCounter } from './stats-counter'

interface ItemActionsProps {
  views?: number
  likes?: number
  ownerId?: string
  onDelete?: (e: React.MouseEvent) => void
  className?: string
}

export function ItemActions({
  views,
  likes,
  ownerId,
  onDelete,
  className = '',
}: ItemActionsProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <StatsCounter views={views} likes={likes} />
      {ownerId && onDelete && (
        <OwnerOnly ownerId={ownerId}>
          <button
            type="button"
            onClick={onDelete}
            className="text-gray-400 hover:text-red-400"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </OwnerOnly>
      )}
    </div>
  )
}
