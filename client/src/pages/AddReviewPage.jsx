import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, MessageSquare } from 'lucide-react'

import useFetch from '../utils/useFetch'
import ReviewForm from '../components/ReviewForm'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'

export default function AddReviewPage() {
  const navigate = useNavigate()

  // Backend: GET /api/professors
  const {
    data: professors,
    loading,
    error,
  } = useFetch('http://localhost:8080/api/professors', { initialData: [] })

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      {/* Top Header & Breadcrumb */}
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
            Share Professor Review
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Contribute constructive, anonymous feedback to assist students across all semesters.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/student/dashboard?tab=review')}
        >
          View My Past Reviews
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium">
          {error}
        </div>
      ) : null}

      {loading ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : (
        <ReviewForm
          professors={professors || []}
          onSubmitted={() => navigate('/student/dashboard?tab=review')}
        />
      )}
    </motion.div>
  )
}
