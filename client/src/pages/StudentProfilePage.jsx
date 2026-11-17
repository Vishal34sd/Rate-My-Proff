import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  GraduationCap,
  Building,
  Layers,
  Calendar,
  Hash,
  MessageSquareQuote,
  Star,
  CheckCircle2,
} from 'lucide-react'

import useFetch from '../utils/useFetch'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import RatingStars from '../components/RatingStars'

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8 max-w-4xl mx-auto"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-2"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Student Profile
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            View your registered academic identity and feedback history.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/student/reviews/new')}
        >
          Write New Review
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-72 rounded-2xl" />
      ) : error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium">
          {error}
        </div>
      ) : user ? (
        <div className="space-y-8">
          {/* Main Profile Info Card */}
          <Card className="overflow-hidden border-border/80 bg-card/95 shadow-xl">
            <div className="h-28 bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-primary/20 border-b border-border/40" />

            <CardContent className="px-6 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-6">
                <div className="flex items-end gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-card bg-gradient-to-tr from-orange-500 to-amber-500 text-3xl font-black text-white shadow-lg">
                    {initials}
                  </div>
                  <div className="space-y-0.5">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                      {user.name || 'Student Name'}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {user.email || 'student@kiet.edu'}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500 border border-emerald-500/20 self-start sm:self-auto">
                  <CheckCircle2 size={13} />
                  Verified {user.role || 'student'}
                </span>
              </div>

              {/* Detail Grid */}
              <div className="grid gap-3 sm:grid-cols-2 pt-4 border-t border-border/60 text-xs">
                <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                  <span className="text-muted-foreground flex items-center gap-1.5 mb-1">
                    <Building size={13} className="text-primary" /> Department
                  </span>
                  <p className="font-semibold text-foreground text-sm">
                    {user.department || 'Not specified'}
                  </p>
                </div>

                <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                  <span className="text-muted-foreground flex items-center gap-1.5 mb-1">
                    <Hash size={13} className="text-primary" /> University Registration No.
                  </span>
                  <p className="font-semibold text-foreground text-sm">
                    {user.registrationNumber || 'Not specified'}
                  </p>
                </div>

                <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                  <span className="text-muted-foreground flex items-center gap-1.5 mb-1">
                    <Calendar size={13} className="text-primary" /> Semester
                  </span>
                  <p className="font-semibold text-foreground text-sm">
                    {user.semester ? `Semester ${user.semester}` : 'Not specified'}
                  </p>
                </div>

                <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                  <span className="text-muted-foreground flex items-center gap-1.5 mb-1">
                    <Layers size={13} className="text-primary" /> Section
                  </span>
                  <p className="font-semibold text-foreground text-sm">
                    {user.section ? `Section ${user.section}` : 'Not specified'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews authored by this student */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <MessageSquareQuote size={18} className="text-primary" />
                Reviews Submitted by You ({myReviews?.length || 0})
              </h2>
            </div>

            {myReviewsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 2 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-36 rounded-2xl" />
                ))}
              </div>
            ) : myReviewsError ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {myReviewsError}
              </div>
            ) : myReviews?.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {myReviews.map((r) => (
                  <Card key={r._id} className="border-border/80 hover:border-primary/40 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base text-foreground truncate">
                            {r?.professor?.name || 'Professor'}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {r?.professor?.department || ''} {r?.subject ? `• ${r.subject}` : ''}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-500">
                          <Star size={11} className="fill-amber-500" />
                          <span>{r.rating}/5</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-xs text-foreground/90 italic leading-relaxed">
                        "{r.comment || 'No written comment'}"
                      </p>
                      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                        {r?.professor?._id && (
                          <button
                            type="button"
                            onClick={() => navigate(`/professor/${r.professor._id}`)}
                            className="text-primary hover:underline font-semibold cursor-pointer"
                          >
                            View Faculty Page →
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
                You haven’t submitted any reviews yet.
              </Card>
            )}
          </div>
        </div>
      ) : null}
    </motion.div>
  )
}
