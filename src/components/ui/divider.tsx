interface DividerProps {
  className?: string
  dashed?: boolean
}

export function Divider({ className = '', dashed = true }: DividerProps) {
  return (
    <div
      className={`
        border-t border-gray-500/50
        ${dashed ? 'border-dashed' : 'border-solid'}
        ${className}
      `}
      role="separator"
    />
  )
}
