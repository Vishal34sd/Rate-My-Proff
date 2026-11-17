import { cn } from '../../lib/utils'

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/80 bg-card text-card-foreground p-6 shadow-sm transition-all duration-200',
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
  return (
    <h3
      className={cn('text-xl font-bold tracking-tight text-foreground', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />
}

function CardContent({ className, ...props }) {
  return <div className={cn('', className)} {...props} />
}

function CardFooter({ className, ...props }) {
  return <div className={cn('mt-4 flex items-center pt-2', className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
