import React from 'react'
import { Star } from 'lucide-react'
import { cn } from '../lib/utils'

const RATING_LABELS = {
  1: 'Poor (1/5)',
  2: 'Fair (2/5)',
  3: 'Good (3/5)',
  4: 'Very Good (4/5)',
  5: 'Excellent (5/5)',
}

function RatingStars({
  value = 0,
  onChange,
  readOnly = false,
  size = 18,
  showLabel = false,
  labels = RATING_LABELS,
  className,
}) {
  const stars = [1, 2, 3, 4, 5]

  const handleStarClick = (star, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!readOnly && onChange) {
      onChange(star)
    }
  }

  return (
    <div className={cn('inline-flex items-center gap-2 select-none', className)}>
      <div className="flex items-center gap-1">
        {stars.map((star) => {
          const isFilled = star <= value

          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={(e) => handleStarClick(star, e)}
              className={cn(
                'relative p-0.5 focus:outline-none',
                readOnly
                  ? 'cursor-default pointer-events-none'
                  : 'cursor-pointer',
              )}
              aria-label={`Rate ${star} out of 5 stars`}
            >
              <Star
                size={size}
                className={cn(
                  'pointer-events-none',
                  isFilled
                    ? 'fill-amber-400 text-amber-500'
                    : 'fill-transparent text-muted-foreground/30',
                )}
              />
            </button>
          )
        })}
      </div>

      {showLabel && !readOnly && value > 0 && (
        <span className="text-xs font-semibold text-primary">
          {labels[value] || `${value}/5`}
        </span>
      )}
    </div>
  )
}

export default RatingStars
