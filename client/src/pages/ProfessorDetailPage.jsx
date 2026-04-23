import React from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'

import { getRole } from '../utils/auth'
import { averageRating, formatScore } from '../lib/utils'
import useFetch from '../utils/useFetch'

import ReviewCard from '../components/ReviewCard'
import ReviewForm from '../components/ReviewForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'

export default function ProfessorDetailPage() {
  const { id } = useParams()
  const role = getRole()

  // Backend: GET /api/professors/:id
  const {
    data: professor,
    loading: professorLoading,
    error: professorError,
    refetch: refetchProfessor,
  } = useFetch(id ? `http://localhost:8080/api/professors/${id}` : null, { initialData: null })

  // Backend: GET /api/professors/:id/reviews
  const {
    data: reviews,
    loading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews,
  } = useFetch(id ? `http://localhost:8080/api/professors/${id}/reviews` : null, { initialData: [] })

  const loading = professorLoading || reviewsLoading
  const error = professorError || reviewsError

  const avg = averageRating(reviews || [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8"
    >
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-28" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : professor ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <span>{professor.name}</span>
              <span className="text-sm font-normal text-(--ui-muted-text)">
                Avg rating: <span className="text-(--ui-text)">{formatScore(avg)}</span>
                <span className="ml-1">({reviews.length} review{reviews.length === 1 ? '' : 's'})</span>
              </span>
            </CardTitle>
            <CardDescription>
              {professor.department} • Subjects: {(professor.subjects || []).join(', ') || '—'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 text-xs text-(--ui-muted-text)">
              {(professor.sections || []).map((sec) => (
                <span
                  key={sec}
                  className="rounded-full border border-(--ui-border) bg-(--ui-muted) px-3 py-1"
                >
                  Section {sec}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-(--ui-strong)">Reviews</h3>
        {loading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-28" />
            ))}
          </div>
        ) : reviews.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {reviews.map((review, idx) => (
              <ReviewCard key={review._id || idx} review={review} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-(--ui-border) bg-(--ui-surface) p-6 text-sm text-(--ui-muted-text)">
            No reviews yet.
          </div>
        )}
      </div>

      {role === 'student' && professor ? (
        <ReviewForm
          professors={[professor]}
          defaultProfessorId={professor._id}
          onSubmitted={() => {
            refetchProfessor()
            refetchReviews()
          }}
        />
      ) : null}
    </motion.div>
  )
}
