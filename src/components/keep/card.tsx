import type { Keep } from '@prisma/client'
import { MdRender } from '@/components/md-render'
import dayjs from 'dayjs'
import Link from 'next/link'
import React from 'react'

interface KeepCardProps {
  note: Keep
}

const KeepCard: React.FC<KeepCardProps> = ({ note }) => {
  return (
    <div
      className="group block p-6 bg-white/10 rounded-lg border border-white/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-max"
    >

      <div className="max-h-40 overflow-auto">
        <MdRender>
          {note.content}
        </MdRender>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <div className="text-sm text-gray-400">
          {dayjs(note.createdAt).format('YYYY年MM月DD日 HH:mm')}
        </div>

        <div className="flex gap-3">
          <Link
            href={`/keep/${note.id}`}
            className="text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </Link>
          <Link
            href={`/keep/save/${note.id}`}
            className="text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.313l-4.5 1 1-4.5 12.862-12.863zM15.75 5.25l3 3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default KeepCard
