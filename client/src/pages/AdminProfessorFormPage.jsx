import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import useFetch from '../utils/useFetch'
import { getToken } from '../utils/auth'

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
  qualification: '',
  post: '',
  experienceYears: '',
  officialEmail: '',
  contactNumber: '',
}

function parseCsv(value) {
  return (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function AdminProfessorFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const editing = useMemo(() => Boolean(id), [id])

  // Backend: GET /api/professors/:id
  const {
    data: professor,
    loading: loadingProfessor,
    error: professorError,
  } = useFetch(editing ? `http://localhost:8080/api/professors/${id}` : null, {
    initialData: null,
  })

  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)

  useEffect(() => {
    if (!editing) return
    if (!professor) return

    setForm({
      name: professor.name || '',
      department: professor.department || professor.dept || '',
      subjects: (professor.subjects || []).join(', '),
      sections: (professor.sections || professor.section || []).join(', '),
      qualification: professor.qualification || '',
      post: professor.post || '',
      experienceYears:
        professor.experienceYears === null || professor.experienceYears === undefined
          ? ''
          : String(professor.experienceYears),
      officialEmail: professor.officialEmail || '',
      contactNumber: professor.contactNumber || '',
    })
    setImageFile(null)
  }, [editing, professor])

  const setValue = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.name.trim() || !form.department.trim()) {
      toast.error('Name and department are required.')
      return
    }

    const payload = new FormData()
    payload.append('name', form.name.trim())
    payload.append('department', form.department.trim())
    payload.append('subjects', form.subjects)
    payload.append('sections', form.sections)
    payload.append('qualification', form.qualification.trim())
    payload.append('post', form.post.trim())
    payload.append('experienceYears', form.experienceYears)
    payload.append('officialEmail', form.officialEmail.trim())
    payload.append('contactNumber', form.contactNumber.trim())
    if (imageFile) payload.append('image', imageFile)

    setSaving(true)
    try {
      const token = getToken()
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }

      if (editing) {
        // Backend: PUT /api/professors/:id
        await axios.put(`http://localhost:8080/api/professors/${id}`, payload, config)
        toast.success('Professor updated.')
      } else {
        // Backend: POST /api/professors
        await axios.post('http://localhost:8080/api/professors', payload, config)
        toast.success('Professor added.')
      }

      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to save professor.')
    } finally {
      setSaving(false)
    }
  }

  const title = editing ? 'Update Professor' : 'Add Professor'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-(--ui-strong)">{title}</h2>
          <p className="text-sm text-(--ui-muted-text)">Manage the professor directory.</p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
          Back to dashboard
        </Button>
      </div>

      {professorError ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {professorError}
        </div>
      ) : null}

      {editing && loadingProfessor ? (
        <Skeleton className="h-80" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              Subjects and sections are comma-separated. Example:{' '}
              <span className="text-(--ui-text)">DBMS, OS</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name" className="mb-2 block">
                  Name
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setValue('name', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="department" className="mb-2 block">
                  Department
                </Label>
                <Input
                  id="department"
                  value={form.department}
                  onChange={(e) => setValue('department', e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="image" className="mb-2 block">
                  Professor image
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
                {editing && professor?.imageUrl ? (
                  <p className="mt-2 text-xs text-(--ui-muted-text)">
                    Current image is already set. Upload a new file to replace it.
                  </p>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="subjects" className="mb-2 block">
                  Subjects
                </Label>
                <Input
                  id="subjects"
                  value={form.subjects}
                  onChange={(e) => setValue('subjects', e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="sections" className="mb-2 block">
                  Sections
                </Label>
                <Input
                  id="sections"
                  value={form.sections}
                  onChange={(e) => setValue('sections', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="post" className="mb-2 block">
                  Post
                </Label>
                <Input id="post" value={form.post} onChange={(e) => setValue('post', e.target.value)} />
              </div>

              <div>
                <Label htmlFor="qualification" className="mb-2 block">
                  Qualification
                </Label>
                <Input
                  id="qualification"
                  value={form.qualification}
                  onChange={(e) => setValue('qualification', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="experienceYears" className="mb-2 block">
                  Experience (years)
                </Label>
                <Input
                  id="experienceYears"
                  type="number"
                  min="0"
                  value={form.experienceYears}
                  onChange={(e) => setValue('experienceYears', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="officialEmail" className="mb-2 block">
                  Official email
                </Label>
                <Input
                  id="officialEmail"
                  type="email"
                  value={form.officialEmail}
                  onChange={(e) => setValue('officialEmail', e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="contactNumber" className="mb-2 block">
                  Contact number
                </Label>
                <Input
                  id="contactNumber"
                  value={form.contactNumber}
                  onChange={(e) => setValue('contactNumber', e.target.value)}
                />
              </div>

              <div className="md:col-span-2 flex flex-wrap items-center justify-end gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
