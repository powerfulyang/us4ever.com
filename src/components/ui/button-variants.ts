import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 hover:-translate-y-[1px] active:scale-[0.98] active:translate-y-0',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md hover:shadow-destructive/20 hover:-translate-y-[1px] active:scale-[0.98] active:translate-y-0',
        outline: 'border border-border bg-background/50 backdrop-blur-sm shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-primary/40 hover:-translate-y-[1px] hover:shadow-md active:scale-[0.98] active:translate-y-0',
        secondary: 'bg-secondary/80 text-secondary-foreground backdrop-blur-sm shadow-sm hover:bg-secondary hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98] active:translate-y-0',
        ghost: 'hover:bg-accent hover:text-accent-foreground hover:-translate-y-[1px] active:scale-[0.98] active:translate-y-0',
        link: 'text-foreground underline-offset-4 hover:underline hover:text-primary transition-colors',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-6',
        icon: 'h-9 w-9',
        xs: 'h-7 rounded-md px-2 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
