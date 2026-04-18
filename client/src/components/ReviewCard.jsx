import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import RatingStars from './RatingStars'
import { averageOfReview, formatScore } from '../lib/utils'

function RatingRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-(--ui-border) py-2 last:border-0">
      <p className="text-sm text-(--ui-text)">{label}</p>
      <div className="flex items-center gap-2">
        <RatingStars value={value} readOnly size={15} />
        <span className="text-xs text-(--ui-muted-text)">{value}</span>
      </div>
    </div>
  )
}

function ReviewCard({ review }) {
  const overall = averageOfReview(review)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>Overall {formatScore(overall)}</span>
          <RatingStars value={Math.round(overall)} readOnly size={15} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <RatingRow label="Teaching" value={review.teaching} />
          <RatingRow label="Leniency" value={review.leniency} />
          <RatingRow label="Attendance" value={review.attendance} />
          <RatingRow label="Exam Checking" value={review.examChecking} />
        </div>
        {review.comment ? <p className="mt-4 text-sm text-(--ui-text)">{review.comment}</p> : null}
      </CardContent>
    </Card>
  )
}

export default ReviewCard
