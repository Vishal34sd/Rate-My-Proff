import React, { useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getToken } from '../utils/auth'
import useFetch from '../utils/useFetch'

import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Skeleton } from '../components/ui/skeleton'

const emptyForm = {
  name: '',
  department: '',
  subjects: '',
  sections: '',
}

function parseCsv(value) {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { data: professors, loading, error, refetch } = useFetch(
    'http://localhost:8080/api/professors',
    { initialData: [] },
  )

  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  const setValue = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const submitCreateOrUpdate = async (event) => {
    event.preventDefault()

    if (!form.name.trim() || !form.department.trim()) {
      toast.error('Name and department are required.')
      return
    }

    const payload = {
      name: form.name.trim(),
      department: form.department.trim(),
      subjects: parseCsv(form.subjects),
      sections: parseCsv(form.sections),
    }

    setCreating(true)
    try {
      const token = getToken()
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
      if (editingId) {
        // Backend: PUT /api/professors/:id
        await axios.put(`http://localhost:8080/api/professors/${editingId}`, payload, config)
        toast.success('Professor updated.')
      } else {
        // Backend: POST /api/professors
        await axios.post('http://localhost:8080/api/professors', payload, config)
        toast.success('Professor added.')
      }

      setForm(emptyForm)
      setEditingId(null)
      refetch()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to save professor.')
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (professor) => {
    setEditingId(professor._id)
    setForm({
      name: professor.name || '',
      department: professor.department || '',
      subjects: (professor.subjects || []).join(', '),
      sections: (professor.sections || []).join(', '),
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

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
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-(--ui-strong)">Admin Dashboard</h2>
        <p className="text-sm text-(--ui-muted-text)">Manage the professor directory.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Update Professor' : 'Add Professor'}</CardTitle>
          <CardDescription>
            Subjects and sections are comma-separated. Example: <span className="text-(--ui-text)">DBMS, OS</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitCreateOrUpdate} className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name" className="mb-2 block">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setValue('name', e.target.value)} />
            </div>

            <div>
              <Label htmlFor="department" className="mb-2 block">Department</Label>
              <Input id="department" value={form.department} onChange={(e) => setValue('department', e.target.value)} />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="subjects" className="mb-2 block">Subjects</Label>
              <Input id="subjects" value={form.subjects} onChange={(e) => setValue('subjects', e.target.value)} />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="sections" className="mb-2 block">Sections</Label>
              <Input id="sections" value={form.sections} onChange={(e) => setValue('sections', e.target.value)} />
            </div>

            <div className="md:col-span-2 flex flex-wrap items-center justify-end gap-2">
              {editingId ? (
                <Button type="button" variant="ghost" onClick={cancelEdit}>
                  Cancel
                </Button>
              ) : null}
              <Button type="submit" disabled={creating}>
                {creating ? 'Saving…' : editingId ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

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
            <Card key={professor._id} className="p-0">
              <div className="p-6">
                <p className="text-lg font-semibold text-(--ui-strong)">{professor.name}</p>
                <p className="text-sm text-(--ui-muted-text)">{professor.department}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => startEdit(professor)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/professor/${professor._id}`)}>
                    View reviews
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(professor._id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  )
}
