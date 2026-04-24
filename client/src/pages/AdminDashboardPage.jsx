import React from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { clearToken, getToken } from '../utils/auth'
import useFetch from '../utils/useFetch'

import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import ProfessorCard from '../components/ProfessorCard'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { data: professors, loading, error, refetch } = useFetch(
    'http://localhost:8080/api/professors',
    { initialData: [] },
  )

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this professor?')
    if (!ok) return

    try {
      const token = getToken()
      await axios.delete(`http://localhost:8080/api/professors/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      toast.success('Professor deleted.')
      refetch()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to delete professor.')
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
          <h2 className="text-2xl font-semibold text-(--ui-strong)">Admin Dashboard</h2>
          <p className="text-sm text-(--ui-muted-text)">Manage the professor directory.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => navigate('/admin/professors/new')}>Add Professor</Button>
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
          {professors.map((professor) => (
            <ProfessorCard
              key={professor._id}
              professor={professor}
              clickable={false}
              actions={
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/admin/professors/${professor._id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/professor/${professor._id}`)}>
                    View reviews
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(professor._id)}>
                    Delete
                  </Button>
                </>
              }
            />
          ))}

          {!professors.length ? (
            <div className="md:col-span-2 rounded-2xl border border-(--ui-border) bg-(--ui-surface) p-6 text-sm text-(--ui-muted-text)">
              No professors found.
            </div>
          ) : null}
        </div>
      )}
    </motion.div>
  )
}
