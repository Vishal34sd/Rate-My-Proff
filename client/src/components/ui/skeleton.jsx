import { cn } from '../../lib/utils'

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-muted/80 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
