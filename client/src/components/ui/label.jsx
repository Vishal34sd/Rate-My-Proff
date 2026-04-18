import { cn } from '../../lib/utils'

function Label({ className, ...props }) {
  return <label className={cn('text-sm font-medium text-(--ui-text)', className)} {...props} />
}

export { Label }
