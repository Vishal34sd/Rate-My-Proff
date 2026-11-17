import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '../lib/utils'

const RATING_LABELS = {
  1: 'Challenging (1/5)',
  2: 'Needs Work (2/5)',
  3: 'Average (3/5)',
  4: 'Very Good (4/5)',
  5: 'Outstanding (5/5)',
}

function RatingStars({
  value = 0,
  onChange,
  readOnly = false,
  size = 18,
  showLabel = false,
  className,
}) {
  const [hoverValue, setHoverValue] = useState(0)
  const stars = [1, 2, 3, 4, 5]
  const displayRating = hoverValue || value || 0

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => !readOnly && setHoverValue(0)}
      >
        {stars.map((star) => {
          const isFilled = star <= displayRating
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => onChange?.(star)}
              onMouseEnter={() => !readOnly && setHoverValue(star)}
              className={cn(
                'relative p-0.5 transition-all duration-150 focus:outline-none',
                readOnly
                  ? 'cursor-default pointer-events-none'
                  : 'cursor-pointer hover:scale-125 active:scale-95',
              )}
              aria-label={`Rate ${star} out of 5 stars`}
            >
              <Star
                size={size}
                className={cn(
                  'transition-colors duration-150',
                  isFilled
                    ? 'fill-amber-400 text-amber-500 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                    : 'text-muted-foreground/30 fill-transparent hover:text-amber-400/50',
                )}
              />
            </button>
          )
        })}
      </div>

      {showLabel && !readOnly && displayRating > 0 && (
        <span className="text-xs font-semibold text-primary transition-opacity animate-in fade-in">
          {RATING_LABELS[displayRating] || `${displayRating}/5`}
        </span>
      )}
    </div>
  )
}

export default RatingStars
