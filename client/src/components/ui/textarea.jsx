import { cn } from '../../lib/utils'

function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'min-h-24 w-full rounded-2xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
