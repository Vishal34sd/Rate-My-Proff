import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'

import { averageRating, formatScore } from '../lib/utils'
import useFetch from '../utils/useFetch'

import ReviewCard from '../components/ReviewCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'

export default function ProfessorDetailPage() {
  const { id } = useParams()
  const [imageFailed, setImageFailed] = useState(false)

  // Backend: GET /api/professors/:id
  const {
    data: professor,
    loading: professorLoading,
    error: professorError,
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

  const apiBase = 'http://localhost:8080'
  const imageUrl = (professor?.imageUrl || '').trim()
  const resolvedImageUrl =
    imageUrl && !imageFailed
      ? imageUrl.startsWith('http')
        ? imageUrl
        : `${apiBase}${imageUrl}`
      : ''
  const initials = (professor?.name || 'P').trim().slice(0, 1).toUpperCase()

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
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 space-y-2">
                <CardTitle className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <span className="truncate">{professor.name}</span>
                  <span className="text-sm font-normal text-(--ui-muted-text)">
                    Avg rating: <span className="text-(--ui-text)">{formatScore(avg)}</span>
                    <span className="ml-1">({reviews.length} review{reviews.length === 1 ? '' : 's'})</span>
                  </span>
                </CardTitle>

                {professor.post ? (
                  <p className="text-sm text-(--ui-muted-text)">{professor.post}</p>
                ) : null}
              </div>

              <div className="shrink-0">
                <div className="h-32 w-32 md:h-40 md:w-40 lg:h-48 lg:w-48 overflow-hidden rounded-2xl border border-(--ui-border) bg-(--ui-muted)">
                  {resolvedImageUrl ? (
                    <img
                      src={resolvedImageUrl}
                      alt={professor?.name ? `${professor.name} photo` : 'Professor photo'}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={() => setImageFailed(true)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-(--ui-text)">
                      {initials}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <CardDescription>
              {(professor.department || '—')} • Subjects: {(professor.subjects || []).join(', ') || '—'}
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

            <div className="mt-4 grid gap-2 text-sm text-(--ui-muted-text) md:grid-cols-2">
              <p>
                <span className="text-(--ui-text)">Post:</span> {professor.post || '—'}
              </p>
              <p>
                <span className="text-(--ui-text)">Qualification:</span> {professor.qualification || '—'}
              </p>
              <p>
                <span className="text-(--ui-text)">Experience:</span>{' '}
                {professor.experienceYears === null || professor.experienceYears === undefined
                  ? '—'
                  : `${professor.experienceYears} year${Number(professor.experienceYears) === 1 ? '' : 's'}`}
              </p>
              <p>
                <span className="text-(--ui-text)">Official email:</span> {professor.officialEmail || '—'}
              </p>
              <p className="md:col-span-2">
                <span className="text-(--ui-text)">Contact:</span> {professor.contactNumber || '—'}
              </p>
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

    </motion.div>
  )
}
