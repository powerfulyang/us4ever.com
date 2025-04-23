import { OwnerOnly } from '@/components/auth/owner-only'
import React from 'react'
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
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </OwnerOnly>
      )}
    </div>
  )
}
