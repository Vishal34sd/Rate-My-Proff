import { MessageSquareQuote, Calendar, BookOpen, UserCheck, Star } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import RatingStars from './RatingStars'
import { formatScore } from '../lib/utils'

function ReviewCard({ review }) {
  const rating = Number(review?.rating || 0)
  const createdAt = review?.createdAt ? new Date(review.createdAt) : null

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/90 transition-all duration-200 hover:border-primary/40 hover:shadow-md">
      <CardContent className="p-5 space-y-3">
        {/* Top Header: Anonymous Student + Rating */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <UserCheck size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Verified Student</p>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                {createdAt ? (
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {createdAt.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                ) : (
                  <span>Recent</span>
                )}
              </div>
            </div>
          </div>

          {/* Rating Pill */}
          <div className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-500 border border-amber-500/20">
            <Star size={13} className="fill-amber-500" />
            <span>{formatScore(rating)}</span>
            <span className="text-muted-foreground/60 text-[10px]">/ 5</span>
          </div>
        </div>

        {/* Subject Chip if available */}
        {review?.subject && (
          <div className="inline-flex items-center gap-1 rounded-md bg-secondary/80 px-2 py-0.5 text-xs font-medium text-foreground/80 border border-border/60">
            <BookOpen size={12} className="text-primary" />
            <span>Course: {review.subject}</span>
          </div>
        )}

        {/* Review Comment Quote */}
        <div className="relative pt-1">
          <p className="text-sm text-foreground/90 leading-relaxed italic">
            "{review?.comment || 'The student left no written comment for this review.'}"
          </p>
        </div>

        {/* Stars Display Footer */}
        <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <span>Overall Experience</span>
          <RatingStars value={Math.round(rating)} readOnly size={14} />
        </div>
      </CardContent>
    </Card>
  )
}

export default ReviewCard
