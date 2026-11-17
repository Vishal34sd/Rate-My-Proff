import { cn } from '../../lib/utils'

function Input({ className, type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2 text-sm text-foreground shadow-xs placeholder:text-muted-foreground/60 transition-all duration-200 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
