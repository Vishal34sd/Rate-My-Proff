import { cn } from '../../lib/utils'

function Label({ className, ...props }) {
  return (
    <label
      className={cn(
        'text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none',
        className,
      )}
      {...props}
    />
  )
}

export { Label }
