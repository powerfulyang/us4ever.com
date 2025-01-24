import type { ReactNode } from 'react'

interface CommonLayoutProps {
  title: string
  description?: string
  children: ReactNode
  rightContent?: ReactNode
}

export function Container({
  title,
  description,
  children,
  rightContent,
}: CommonLayoutProps) {
  return (
    <>
      <div className="flex items-center justify-between flex-wrap mb-6 gap-4">
        <div className="px-2">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
            {title}
          </h1>
          {description && <p className="text-sm text-gray-400">{description}</p>}
        </div>
        {rightContent}
      </div>
      {children}
    </>
  )
}
