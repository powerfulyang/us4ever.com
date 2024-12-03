interface LoadingSpinnerProps {
  text?: string
  minHeight?: string
}

export function LoadingSpinner({
  text = '加载中...',
  minHeight = '50vh',
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12" style={{ minHeight }}>
      <div className="relative w-20 h-20">
        <div className="absolute w-full h-full border-4 border-purple-500/30 rounded-full" />
        <div className="absolute w-full h-full border-4 border-t-purple-500 rounded-full animate-spin" />
      </div>
      <p className="mt-8 text-lg font-medium text-gray-400 animate-pulse">
        {text}
      </p>
    </div>
  )
}
