import { cn } from '../../lib/utils'

function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-2xl border border-(--ui-border) bg-(--ui-surface) px-3 py-2 text-sm text-(--ui-text) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export { Select }
