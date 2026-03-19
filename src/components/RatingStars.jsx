import { Star } from 'lucide-react'

import { cn } from '../lib/utils'

function RatingStars({ value = 0, onChange, readOnly = false, size = 18 }) {
  const stars = [1, 2, 3, 4, 5]

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => {
        const active = star <= value

        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(star)}
            className={cn(
              'transition-transform duration-200',
              readOnly ? 'cursor-default' : 'hover:scale-110',
            )}
            aria-label={`Set rating to ${star}`}
          >
            <Star
              size={size}
              className={cn(
                active
                  ? 'fill-sky-400 text-sky-500 dark:text-sky-300'
                  : 'text-slate-300 dark:text-slate-600',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

export default RatingStars
