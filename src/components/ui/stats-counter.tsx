interface StatsCounterProps {
  views?: number
  likes?: number
  className?: string
}

export function StatsCounter({ views, likes, className = '' }: StatsCounterProps) {
  return (
    <div className={`flex items-center gap-4 text-sm text-gray-400 ${className}`}>
      {typeof views === 'number' && (
        <span>
          浏览:
          <span className="pl-1">{views}</span>
        </span>
      )}
      {typeof likes === 'number' && (
        <span>
          点赞:
          <span className="pl-1">{likes}</span>
        </span>
      )}
    </div>
  )
}
