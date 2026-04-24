import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-(--ui-strong)">Add Review</h2>
          <p className="text-sm text-(--ui-muted-text)">Submit an anonymous review for a professor.</p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/student/dashboard')}>
          Back to dashboard
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {loading ? <Skeleton className="h-96" /> : <ReviewForm professors={professors || []} />}
    </motion.div>
  )
}
