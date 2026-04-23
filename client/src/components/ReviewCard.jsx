import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import RatingStars from './RatingStars'
import { formatScore } from '../lib/utils'

function ReviewCard({ review }) {
  const rating = Number(review?.rating || 0)
  const createdAt = review?.createdAt ? new Date(review.createdAt) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="space-y-0.5">
            <p>
              Rating {formatScore(rating)}
              {review?.subject ? <span className="ml-2 text-xs text-(--ui-muted-text)">({review.subject})</span> : null}
            </p>
            {createdAt ? (
              <p className="text-xs text-(--ui-muted-text)">{createdAt.toLocaleString()}</p>
            ) : null}
          </div>
          <RatingStars value={Math.round(rating)} readOnly size={15} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {review?.comment ? (
          <p className="text-sm text-(--ui-text)">{review.comment}</p>
        ) : (
          <p className="text-sm text-(--ui-muted-text)">No comment.</p>
        )}
      </CardContent>
    </Card>
  )
}

export default ReviewCard
