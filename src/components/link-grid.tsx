import type { LinkGridProps } from '@/app/(full-layout)/page'
import Link from 'next/link'
import React from 'react'

export function LinkGrid({ links, title }: LinkGridProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map(link => (
          <Link
            key={link.title}
            href={link.href}
            className="group bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:border-purple-500/50 transition-all duration-300"
            target={link.target}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/5 rounded-xl text-purple-400 group-hover:text-white transition-colors">
                {link.icon}
              </div>
              <h3 className="text-xl font-semibold text-white">
                {link.title}
              </h3>
            </div>
            <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
              {link.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
