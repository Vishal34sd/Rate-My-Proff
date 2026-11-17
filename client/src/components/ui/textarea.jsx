import { cn } from '../../lib/utils'

function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'flex min-h-28 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2.5 text-sm text-foreground shadow-xs placeholder:text-muted-foreground/60 transition-all duration-200 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 resize-y',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
