import React from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { getToken } from '../utils/auth'
import useFetch from '../utils/useFetch'

import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import RatingStars from '../components/RatingStars'

export default function AdminFlaggedReviewsPage() {
  const navigate = useNavigate()

  // Backend: GET /api/reviews/flagged
  const { data: reviews, loading, error, refetch } = useFetch(
    'http://localhost:8080/api/reviews/flagged',
    { initialData: [] },
  )

  const handleResolve = async (id, action) => {
    const confirmMsg =
      action === 'remove'
        ? 'Remove this review? It will be hidden from students.'
        : 'Dismiss this report and clear all flags on this review?'
    if (!window.confirm(confirmMsg)) return

    try {
      const token = getToken()
      // Backend: PATCH /api/reviews/:id/resolve
      await axios.patch(
        `http://localhost:8080/api/reviews/${id}/resolve`,
        { action },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      )
      toast.success(action === 'remove' ? 'Review removed.' : 'Report dismissed.')
      refetch()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to resolve report.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-(--ui-strong)">Flagged Reviews</h2>
          <p className="text-sm text-(--ui-muted-text)">Review reports from students and take action.</p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
          Back to dashboard
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-40" />
          ))}
        </div>
      ) : reviews.length ? (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review._id}>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                  <span>
                    {review.professor?.name || 'Unknown professor'}
                    <span className="ml-2 text-xs font-normal text-(--ui-muted-text)">
                      ({review.subject})
                    </span>
                  </span>
                  <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-300">
                    {review.flagCount} report{review.flagCount === 1 ? '' : 's'}
                    {review.status === 'under_review' ? ' • Under review' : ''}
                  </span>
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <RatingStars value={Math.round(review.rating)} readOnly size={13} />
                  <span>
                    Author: {review.student?.name || 'Unknown'} ({review.student?.email || '—'})
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-(--ui-text)">{review.comment || 'No comment.'}</p>

                <div className="space-y-2 rounded-xl border border-(--ui-border) bg-(--ui-muted) p-3">
                  <p className="text-xs font-semibold text-(--ui-strong)">Reports</p>
                  {(review.flags || []).map((flag) => (
                    <div key={flag._id} className="text-xs text-(--ui-muted-text)">
                      <span className="text-(--ui-text)">{flag.reportedBy?.name || 'Anonymous'}</span>
                      {' — '}
                      <span className="capitalize">{flag.reason}</span>
                      {flag.comment ? `: "${flag.comment}"` : ''}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleResolve(review._id, 'dismiss')}
                  >
                    Dismiss
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResolve(review._id, 'remove')}
                  >
                    Remove review
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-(--ui-border) bg-(--ui-surface) p-6 text-sm text-(--ui-muted-text)">
          No flagged reviews. 🎉
        </div>
      )}
    </motion.div>
  )
}