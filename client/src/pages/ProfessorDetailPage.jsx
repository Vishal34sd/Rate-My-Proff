import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Star,
  BookOpen,
  GraduationCap,
  Mail,
  Phone,
  Briefcase,
  Layers,
  ArrowLeft,
  Plus,
  MessageSquare,
  Award,
  CheckCircle2,
  Copy,
  Check,
  Filter,
} from 'lucide-react'

import { averageRating, formatScore } from '../lib/utils'
import useFetch from '../utils/useFetch'
import { isLoggedIn, getRole } from '../utils/auth'

import ReviewCard from '../components/ReviewCard'
import ReviewForm from '../components/ReviewForm'
import RatingStars from '../components/RatingStars'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'

export default function ProfessorDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [imageFailed, setImageFailed] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All')
  const [sortBy, setSortBy] = useState('recent') // 'recent' | 'highest' | 'lowest'

  const authed = isLoggedIn()
  const role = getRole()

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
  } = useFetch(id ? `http://localhost:8080/api/professors/${id}/reviews` : null, {
    initialData: [],
  })

  const loading = professorLoading || reviewsLoading
  const error = professorError || reviewsError

  // Calculated average rating
  const avg = useMemo(() => {
    if (!reviews || !reviews.length) {
      return professor?.overallRating || 0
    }
    return averageRating(reviews)
  }, [reviews, professor])

  // Rating distribution counts (1..5)
  const ratingDistribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    if (!reviews || !reviews.length) return counts
    reviews.forEach((r) => {
      const val = Math.round(Number(r.rating || 0))
      if (val >= 1 && val <= 5) counts[val]++
    })
    return counts
  }, [reviews])

  // Filtered & sorted reviews
  const displayedReviews = useMemo(() => {
    let list = (reviews || []).filter((r) => {
      if (selectedSubjectFilter === 'All') return true
      return r.subject === selectedSubjectFilter
    })

    if (sortBy === 'recent') {
      list = [...list].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
      )
    } else if (sortBy === 'highest') {
      list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    } else if (sortBy === 'lowest') {
      list = [...list].sort((a, b) => (a.rating || 0) - (b.rating || 0))
    }

    return list
  }, [reviews, selectedSubjectFilter, sortBy])

  const availableReviewSubjects = useMemo(() => {
    const list = new Set((reviews || []).map((r) => r.subject).filter(Boolean))
    return ['All', ...Array.from(list)]
  }, [reviews])

  const handleWriteReviewClick = () => {
    if (!authed) {
      toast.info('Please sign in to submit a review.')
      navigate('/login', { state: { from: `/professor/${id}` } })
      return
    }
    setShowReviewForm(!showReviewForm)
  }

  const apiBase = 'http://localhost:8080'
  const imageUrl = (professor?.imageUrl || '').trim()
  const resolvedImageUrl =
    imageUrl && !imageFailed
      ? imageUrl.startsWith('http')
        ? imageUrl
        : `${apiBase}${imageUrl}`
      : ''
  const initials = (professor?.name || 'P').trim().slice(0, 1).toUpperCase()

  const copyEmail = () => {
    if (!professor?.officialEmail) return
    navigator.clipboard.writeText(professor.officialEmail)
    setCopiedEmail(true)
    toast.success('Official email copied to clipboard')
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  const handleReviewSubmitted = () => {
    refetchReviews()
    setShowReviewForm(false)
  }

  const backLink =
    role === 'student' ? '/student/dashboard' : role === 'admin' ? '/admin/dashboard' : '/'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8 max-w-6xl mx-auto"
    >
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(backLink)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          <span>Back to Directory</span>
        </button>

        {role === 'admin' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/professors/${id}/edit`)}
          >
            Edit Faculty Info
          </Button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-44 rounded-3xl" />
        </div>
      ) : professor ? (
        <div className="space-y-8">
          {/* ======================= PROFESSOR HERO PROFILE ======================= */}
          <Card className="overflow-hidden border-border/80 bg-card/95 shadow-xl backdrop-blur-md">
            <div className="h-28 bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-primary/25 border-b border-border/40" />

            <CardContent className="px-6 pb-6 pt-0 relative">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-14 mb-6">
                {/* Avatar / Photo + Identity */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                  <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl overflow-hidden border-4 border-card bg-card shadow-xl shrink-0">
                    {resolvedImageUrl ? (
                      <img
                        src={resolvedImageUrl}
                        alt={professor.name}
                        className="h-full w-full object-cover"
                        onError={() => setImageFailed(true)}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-primary/30 to-amber-500/30 text-4xl font-black text-primary">
                        {initials}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                        {professor.name}
                      </h1>
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/20">
                        <GraduationCap size={13} />
                        {professor.department || 'General'}
                      </span>
                    </div>

                    {professor.post && (
                      <p className="text-sm font-medium text-muted-foreground">
                        {professor.post}
                      </p>
                    )}

                    {professor.qualification && (
                      <p className="text-xs text-muted-foreground/80">
                        {professor.qualification}
                      </p>
                    )}
                  </div>
                </div>

                {/* Score & Review Action Pill */}
                <div className="flex flex-wrap items-center gap-3 self-start md:self-end">
                  <div className="rounded-2xl border border-border/80 bg-muted/40 px-4 py-2.5 flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-black text-foreground leading-none">
                        {formatScore(avg)}
                      </p>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-0.5">
                        {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                      </p>
                    </div>
                    <RatingStars value={Math.round(avg)} readOnly size={18} />
                  </div>

                  <Button
                    onClick={handleWriteReviewClick}
                    className="gap-2 shadow-md shadow-primary/20"
                  >
                    <Plus size={16} />
                    {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                  </Button>
                </div>
              </div>

              {/* Badges Strip & Academic Details */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-border/60 pt-5 text-xs">
                {/* Experience */}
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Briefcase size={13} /> Academic Experience
                  </span>
                  <p className="font-semibold text-foreground text-sm">
                    {professor.experienceYears
                      ? `${professor.experienceYears} Years`
                      : 'Faculty Member'}
                  </p>
                </div>

                {/* Sections */}
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Layers size={13} /> Assigned Sections
                  </span>
                  <p className="font-semibold text-foreground text-sm">
                    {professor.sections?.length ? professor.sections.join(', ') : 'All Batches'}
                  </p>
                </div>

                {/* Official Email */}
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Mail size={13} /> Official Email
                  </span>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-foreground text-sm truncate">
                      {professor.officialEmail || 'Not listed'}
                    </span>
                    {professor.officialEmail && (
                      <button
                        type="button"
                        onClick={copyEmail}
                        className="text-muted-foreground hover:text-primary transition-colors cursor-pointer p-0.5"
                        title="Copy email"
                      >
                        {copiedEmail ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Phone size={13} /> Campus Contact
                  </span>
                  <p className="font-semibold text-foreground text-sm">
                    {professor.contactNumber || 'Available via Dept'}
                  </p>
                </div>
              </div>

              {/* Subjects Pills */}
              {professor.subjects?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/60 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-muted-foreground mr-1">
                    Courses Taught:
                  </span>
                  {professor.subjects.map((subj, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 text-xs font-semibold text-foreground border border-border/60"
                    >
                      <BookOpen size={12} className="text-primary" />
                      {subj}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ======================= INLINE REVIEW FORM DRAWER ======================= */}
          <AnimatePresence>
            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <ReviewForm
                  professors={[professor]}
                  defaultProfessorId={professor._id}
                  onSubmitted={handleReviewSubmitted}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ======================= RATING BREAKDOWN & REVIEWS SECTION ======================= */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left: Rating Breakdown Card */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Rating Breakdown</CardTitle>
                  <CardDescription className="text-xs">
                    Distribution of scores from all submitted student reviews
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-2">
                    <div className="text-4xl font-black text-foreground">
                      {formatScore(avg)}
                    </div>
                    <RatingStars value={Math.round(avg)} readOnly size={20} className="justify-center mt-1" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Based on {reviews.length} student review{reviews.length === 1 ? '' : 's'}
                    </p>
                  </div>

                  {/* Rating Bars */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = ratingDistribution[star] || 0
                      const percentage = reviews.length ? Math.round((count / reviews.length) * 100) : 0
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="w-12 font-medium text-foreground flex items-center gap-0.5">
                            {star} <Star size={11} className="fill-amber-500 text-amber-500" />
                          </span>
                          <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-muted-foreground font-semibold">
                            {percentage}%
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Anonymity Assurance Notice */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2 font-bold text-primary">
                  <CheckCircle2 size={16} />
                  <span>Student Review Policy</span>
                </div>
                <p className="leading-relaxed">
                  All reviews on Rate My Proff are confidential and verified to preserve genuine peer feedback. Focus on learning outcomes, grading clarity, and lecture engagement.
                </p>
              </div>
            </div>

            {/* Right: Reviews List with Filtering & Sorting */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    Student Reviews ({displayedReviews.length})
                  </h2>
                </div>

                {/* Filter and Sort controls */}
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-muted-foreground" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground outline-none cursor-pointer"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                  </select>
                </div>
              </div>

              {/* Subject filter chips if multiple subjects exist */}
              {availableReviewSubjects.length > 2 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs text-muted-foreground mr-1">Filter Course:</span>
                  {availableReviewSubjects.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSelectedSubjectFilter(sub)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors cursor-pointer ${
                        selectedSubjectFilter === sub
                          ? 'bg-primary text-primary-foreground font-semibold'
                          : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
              {displayedReviews.length > 0 ? (
                <div className="space-y-4">
                  {displayedReviews.map((review, idx) => (
                    <ReviewCard key={review._id || idx} review={review} />
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-border bg-card/60 p-10 text-center space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <MessageSquare size={26} />
                  </div>
                  <h3 className="text-base font-bold text-foreground">No reviews yet for this professor</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Attended this professor's classes? Share your honest experience to help other students prepare!
                  </p>
                  <Button
                    onClick={() => setShowReviewForm(true)}
                    className="mt-2 gap-2 shadow-md shadow-primary/20"
                  >
                    <Plus size={16} /> Write First Review
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </motion.div>
  )
}
