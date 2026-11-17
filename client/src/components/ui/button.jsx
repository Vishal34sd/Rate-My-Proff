import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:shadow-orange-500/25',
        secondary:
          'border border-border bg-card text-foreground hover:bg-muted hover:border-border/80 shadow-xs',
        outline:
          'border border-border/80 bg-transparent text-foreground hover:bg-muted hover:text-foreground',
        ghost:
          'text-muted-foreground hover:bg-muted hover:text-foreground',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm shadow-destructive/20',
        subtle:
          'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-11 rounded-xl px-6 text-base',
        icon: 'h-9 w-9 p-0 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? 'span' : 'button'

  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
