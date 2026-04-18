import { cn } from '../../lib/utils'

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-(--ui-border) bg-(--ui-surface) p-6 shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }) {
  return <div className={cn('mb-4 space-y-1.5', className)} {...props} />
}

function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-xl font-semibold text-(--ui-strong)', className)} {...props} />
}

function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-(--ui-muted-text)', className)} {...props} />
}

function CardContent({ className, ...props }) {
  return <div className={cn('', className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent }
