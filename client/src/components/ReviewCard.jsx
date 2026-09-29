import { useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Select } from './ui/select'
import { Textarea } from './ui/textarea'
import RatingStars from './RatingStars'
import { formatScore } from '../lib/utils'
import { getToken, isLoggedIn } from '../utils/auth'

const FLAG_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'offensive', label: 'Offensive language' },
  { value: 'irrelevant', label: 'Irrelevant content' },
  { value: 'fake', label: 'Fake / not credible' },
  { value: 'other', label: 'Other' },
]

function ReviewCard({ review }) {
  const rating = Number(review?.rating || 0)
  const createdAt = review?.createdAt ? new Date(review.createdAt) : null

  const [showFlagForm, setShowFlagForm] = useState(false)
  const [reason, setReason] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reported, setReported] = useState(false)

  const handleFlag = async (event) => {
    event.preventDefault()
    if (!reason) {
      toast.error('Please choose a reason.')
      return
    }

    setSubmitting(true)
    try {
      const token = getToken()
      // Backend: POST /api/reviews/:id/flag
      await axios.post(
        `http://localhost:8080/api/reviews/${review._id}/flag`,
        { reason, comment: comment.trim() },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      )
      toast.success('Review reported. Our team will look into it.')
      setReported(true)
      setShowFlagForm(false)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to report review.')
    } finally {
      setSubmitting(false)
    }
  }

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
      <CardContent className="space-y-3">
        {review?.comment ? (
          <p className="text-sm text-(--ui-text)">{review.comment}</p>
        ) : (
          <p className="text-sm text-(--ui-muted-text)">No comment.</p>
        )}

        {isLoggedIn() && review?._id ? (
          <div className="border-t border-(--ui-border) pt-2">
            {reported ? (
              <p className="text-xs text-(--ui-muted-text)">Reported. Thanks for flagging this.</p>
            ) : !showFlagForm ? (
              <button
                type="button"
                onClick={() => setShowFlagForm(true)}
                className="text-xs text-(--ui-muted-text) hover:text-red-400 transition-colors"
              >
                🚩 Report this review
              </button>
            ) : (
              <form onSubmit={handleFlag} className="space-y-2">
                <Select value={reason} onChange={(e) => setReason(e.target.value)}>
                  <option value="">Select a reason</option>
                  {FLAG_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </Select>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a short note (optional)"
                  className="min-h-16"
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" variant="secondary" disabled={submitting}>
                    {submitting ? 'Reporting…' : 'Submit report'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowFlagForm(false)
                      setReason('')
                      setComment('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default ReviewCard