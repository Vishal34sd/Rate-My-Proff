import { cn } from '../../lib/utils'

function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'flex h-11 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2 text-sm text-foreground shadow-xs transition-all duration-200 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export { Select }
