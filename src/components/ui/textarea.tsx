import * as React from 'react'

import { cn } from '@/utils'

function Textarea({ ref, className, ...props }: React.ComponentProps<'textarea'> & { ref?: React.RefObject<HTMLTextAreaElement> }) {
  return (
    <textarea
      className={cn(
        'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:outline-none',
        'transition-all duration-200',
        'border border-white/20',
        'focus:border-purple-500/50 focus:outline-none',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
}
Textarea.displayName = 'Textarea'

export { Textarea }
