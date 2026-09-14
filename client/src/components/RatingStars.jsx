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
            aria-label={`Set rating to ${star} star${star>1 ? 's' : ''}`}
          >
            <Star
              size={size}
              className={cn(
                active
                  ? 'fill-primary text-primary'
                  : 'text-muted-foreground/30',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

export default RatingStars
