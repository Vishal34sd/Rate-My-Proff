import { cn } from '../../lib/utils'

function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-2xl border border-border bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export { Select }
