import type { VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'
import { Loader2 } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { buttonVariants } from './button-variants'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

function Button({ ref, className, variant, size, asChild = false, isLoading, leftIcon, rightIcon, children, disabled, ...props }: ButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> }) {
  if (asChild) {
    return (
      <Slot
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Slot>
    )
  }

  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
      )}
      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  )
}
Button.displayName = 'Button'

export { Button }
