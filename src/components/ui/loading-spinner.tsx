import { Loader2 } from 'lucide-react'

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
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-4 text-sm text-foreground font-medium">
        {text}
      </p>
    </div>
  )
}
