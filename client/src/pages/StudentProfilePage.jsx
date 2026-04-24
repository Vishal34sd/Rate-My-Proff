import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

import useFetch from '../utils/useFetch'

import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'

export default function StudentProfilePage() {
  const navigate = useNavigate()

  const { data: user, loading, error } = useFetch('http://localhost:8080/api/auth/me', {
    initialData: null,
  })

  const {
    data: myReviews,
    loading: myReviewsLoading,
    error: myReviewsError,
  } = useFetch('http://localhost:8080/api/reviews/me', { initialData: [] })

  const initials = (user?.name || 'Student').trim().slice(0, 1).toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-(--ui-strong)">Student Profile</h2>
          <p className="text-sm text-(--ui-muted-text)">Your account details.</p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/student/dashboard')}>
          Back to dashboard
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-80" />
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : user ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl border border-(--ui-border) bg-(--ui-muted) text-(--ui-text) flex items-center justify-center text-2xl font-bold">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="truncate">{user.name || '—'}</CardTitle>
                    <CardDescription className="truncate">{user.email || '—'}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 text-sm text-(--ui-muted-text) md:grid-cols-2">
                <p>
                  <span className="text-(--ui-text)">Role:</span> {user.role || '—'}
                </p>
                <p>
                  <span className="text-(--ui-text)">Department:</span> {user.department || '—'}
                </p>
                <p>
                  <span className="text-(--ui-text)">Section:</span> {user.section || '—'}
                </p>
                <p>
                  <span className="text-(--ui-text)">Semester:</span>{' '}
                  {user.semester === null || user.semester === undefined ? '—' : String(user.semester)}
                </p>
                <p className="md:col-span-2">
                  <span className="text-(--ui-text)">Registration number:</span>{' '}
                  {user.registrationNumber || '—'}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-(--ui-strong)">My Reviews</h3>

            {myReviewsLoading ? (
              <div className="grid gap-3 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-32" />
                ))}
              </div>
            ) : myReviewsError ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {myReviewsError}
              </div>
            ) : myReviews?.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {myReviews.map((r) => (
                  <Card key={r._id}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {r?.professor?.name || 'Professor'}
                      </CardTitle>
                      <CardDescription>
                        {r?.professor?.department || '—'} • {r?.subject || '—'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-(--ui-muted-text)">
                        <span className="text-(--ui-text)">Rating:</span> {r.rating}/5
                      </p>
                      <p className="mt-2 text-sm text-(--ui-muted-text)">
                        <span className="text-(--ui-text)">Comment:</span> {r.comment || '—'}
                      </p>
                      <p className="mt-2 text-xs text-(--ui-muted-text)">
                        {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-(--ui-border) bg-(--ui-surface) p-6 text-sm text-(--ui-muted-text)">
                You haven’t submitted any reviews yet.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </motion.div>
  )
}
