import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

import useFetch from '../utils/useFetch'
import { clearToken } from '../utils/auth'

import ProfessorCard from '../components/ProfessorCard'
import SearchBar from '../components/SearchBar'
import { Skeleton } from '../components/ui/skeleton'
import { Button } from '../components/ui/button'

export default function StudentDashboardPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const profileLetter = 'S'

  // Backend: GET /api/professors
  const { data: professors, loading, error } = useFetch(
    'http://localhost:8080/api/professors',
    { initialData: [] },
  )

  const filtered = (professors || []).filter((p) =>
    p?.name?.toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-(--ui-strong)">Student Dashboard</h2>
        <p className="text-sm text-(--ui-muted-text)">
          Search professors, open details, and submit anonymous reviews.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-md">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate('/student/profile')}
            className="gap-2"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--ui-border) bg-(--ui-muted) text-sm font-semibold text-(--ui-text)">
              {profileLetter}
            </span>
            Profile
          </Button>
          <Button onClick={() => navigate('/student/reviews/new')}>Add Review</Button>
          <Button
            variant="ghost"
            onClick={() => {
              clearToken()
              navigate('/', { replace: true })
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-40" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((professor) => (
            <ProfessorCard key={professor._id} professor={professor} />
          ))}

          {!filtered.length ? (
            <div className="md:col-span-2 rounded-2xl border border-(--ui-border) bg-(--ui-surface) p-6 text-sm text-(--ui-muted-text)">
              No professors found.
            </div>
          ) : null}
        </div>
      )}
    </motion.div>
  )
}
