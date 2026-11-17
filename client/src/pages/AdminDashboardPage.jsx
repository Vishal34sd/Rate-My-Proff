import React, { useState, useMemo } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ShieldAlert,
  Plus,
  Users,
  Search,
  Building,
  Edit,
  Trash2,
  Eye,
  LogOut,
  AlertTriangle,
  X,
} from 'lucide-react'

import { clearToken, getToken } from '../utils/auth'
import useFetch from '../utils/useFetch'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import ProfessorCard from '../components/ProfessorCard'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const { data: professors, loading, error, refetch } = useFetch(
    'http://localhost:8080/api/professors',
    { initialData: [] },
  )

  const filteredProfessors = useMemo(() => {
    if (!professors) return []
    return professors.filter((p) => {
      const q = search.trim().toLowerCase()
      if (!q) return true
      return (
        p.name?.toLowerCase().includes(q) ||
        p.department?.toLowerCase().includes(q) ||
        p.subjects?.some((s) => s.toLowerCase().includes(q))
      )
    })
  }, [professors, search])

  const deptCount = useMemo(() => {
    if (!professors) return 0
    return new Set(professors.map((p) => p.department).filter(Boolean)).size
  }, [professors])

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const token = getToken()
      await axios.delete(`http://localhost:8080/api/professors/${deleteTarget._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      toast.success(`Professor ${deleteTarget.name} deleted successfully.`)
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to delete professor.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8 max-w-6xl mx-auto"
    >
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-600 dark:text-orange-400 border border-orange-500/20">
              <ShieldAlert size={14} />
              Administrator Console
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Faculty Directory Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Add new professors, edit curriculum details, or manage directory records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => navigate('/admin/professors/new')}
            className="gap-2 shadow-md shadow-primary/20"
          >
            <Plus size={16} /> Add Professor
          </Button>

          <Button
            variant="ghost"
            onClick={() => {
              clearToken()
              navigate('/', { replace: true })
            }}
            className="text-muted-foreground hover:text-destructive gap-1.5"
          >
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Total Faculty</span>
            <Users size={16} className="text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground">{professors?.length || 0}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Listed professors</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Departments</span>
            <Building size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-foreground">{deptCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Academic branches</p>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Directory Status</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-2xl font-black text-emerald-500">Live</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Auto-synced with API</p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter professors by name, department, or subject..."
          className="h-11 w-full rounded-xl border border-border/80 bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {/* Directory Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredProfessors.map((professor) => (
            <ProfessorCard
              key={professor._id}
              professor={professor}
              clickable={false}
              actions={
                <div className="flex flex-wrap items-center gap-1.5 w-full justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={() => navigate(`/professor/${professor._id}`)}
                  >
                    <Eye size={13} /> View
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={() => navigate(`/admin/professors/${professor._id}/edit`)}
                  >
                    <Edit size={13} /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={() => setDeleteTarget(professor)}
                  >
                    <Trash2 size={13} /> Delete
                  </Button>
                </div>
              }
            />
          ))}

          {!filteredProfessors.length ? (
            <div className="md:col-span-2 rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
              No professors found matching your query.
            </div>
          ) : null}
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                    <AlertTriangle size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Confirm Deletion</h3>
                    <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Are you sure you want to remove <strong>{deleteTarget.name}</strong> ({deleteTarget.department}) from the professor directory?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="gap-1.5"
                >
                  {deleting ? 'Deleting...' : 'Delete Professor'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
