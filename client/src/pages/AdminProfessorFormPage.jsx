import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft,
  User,
  Building,
  Upload,
  BookOpen,
  Layers,
  GraduationCap,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  Save,
  CheckCircle2,
} from 'lucide-react'

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
  const [previewUrl, setPreviewUrl] = useState('')

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
    if (professor.imageUrl) {
      const fullUrl = professor.imageUrl.startsWith('http')
        ? professor.imageUrl
        : `http://localhost:8080${professor.imageUrl}`
      setPreviewUrl(fullUrl)
    }
  }, [editing, professor])

  const setValue = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null
    setImageFile(file)
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.name.trim() || !form.department.trim()) {
      toast.error('Both Professor Name and Department are required.')
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
        toast.success('Professor details updated.')
      } else {
        // Backend: POST /api/professors
        await axios.post('http://localhost:8080/api/professors', payload, config)
        toast.success('Professor added successfully.')
      }

      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to save professor.')
    } finally {
      setSaving(false)
    }
  }

  const pageTitle = editing ? 'Update Professor Details' : 'Add New Faculty Member'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-2"
          >
            <ArrowLeft size={14} /> Back to Admin Console
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Maintain accurate curriculum, qualifications, and official contact credentials.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/dashboard')}
        >
          Cancel
        </Button>
      </div>

      {professorError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {professorError}
        </div>
      ) : null}

      {editing && loadingProfessor ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : (
        <Card className="border-border/80 bg-card/95 shadow-xl">
          <CardHeader className="border-b border-border/60 pb-5">
            <CardTitle className="text-lg sm:text-xl">Professor Information Form</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Separate multiple subjects and sections with commas (e.g. "DBMS, OS, Python" or "A, B, C").
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload with Thumbnail Preview */}
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <Label className="flex items-center gap-1.5 mb-2">
                  <Upload size={14} className="text-primary" />
                  Faculty Photo / Avatar
                </Label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-border bg-card shrink-0 shadow-sm flex items-center justify-center">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User size={32} className="text-muted-foreground/60" />
                    )}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer file:cursor-pointer"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      PNG, JPG, or WEBP. Max resolution recommended: 800x800px.
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Identity Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="name" className="flex items-center gap-1.5">
                    <User size={13} className="text-primary" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setValue('name', e.target.value)}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className="bg-card"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="department" className="flex items-center gap-1.5">
                    <Building size={13} className="text-primary" />
                    Department / Branch *
                  </Label>
                  <Input
                    id="department"
                    value={form.department}
                    onChange={(e) => setValue('department', e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    className="bg-card"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="post" className="flex items-center gap-1.5">
                    <GraduationCap size={13} className="text-primary" />
                    Designation / Post
                  </Label>
                  <Input
                    id="post"
                    value={form.post}
                    onChange={(e) => setValue('post', e.target.value)}
                    placeholder="e.g. Associate Professor & HOD"
                    className="bg-card"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="qualification" className="flex items-center gap-1.5">
                    <Briefcase size={13} className="text-primary" />
                    Qualification
                  </Label>
                  <Input
                    id="qualification"
                    value={form.qualification}
                    onChange={(e) => setValue('qualification', e.target.value)}
                    placeholder="e.g. Ph.D (IIT Delhi), M.Tech"
                    className="bg-card"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="subjects" className="flex items-center gap-1.5">
                    <BookOpen size={13} className="text-primary" />
                    Subjects Taught (Comma-separated)
                  </Label>
                  <Input
                    id="subjects"
                    value={form.subjects}
                    onChange={(e) => setValue('subjects', e.target.value)}
                    placeholder="e.g. Database Management Systems, Compiler Design, Computer Networks"
                    className="bg-card"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="sections" className="flex items-center gap-1.5">
                    <Layers size={13} className="text-primary" />
                    Sections (Comma-separated)
                  </Label>
                  <Input
                    id="sections"
                    value={form.sections}
                    onChange={(e) => setValue('sections', e.target.value)}
                    placeholder="e.g. A, B, C"
                    className="bg-card"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="experienceYears" className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-primary" />
                    Experience (Years)
                  </Label>
                  <Input
                    id="experienceYears"
                    type="number"
                    min="0"
                    value={form.experienceYears}
                    onChange={(e) => setValue('experienceYears', e.target.value)}
                    placeholder="e.g. 12"
                    className="bg-card"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="officialEmail" className="flex items-center gap-1.5">
                    <Mail size={13} className="text-primary" />
                    Official Email
                  </Label>
                  <Input
                    id="officialEmail"
                    type="email"
                    value={form.officialEmail}
                    onChange={(e) => setValue('officialEmail', e.target.value)}
                    placeholder="e.g. rajesh.kumar@kiet.edu"
                    className="bg-card"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="contactNumber" className="flex items-center gap-1.5">
                    <Phone size={13} className="text-primary" />
                    Campus Contact / Phone
                  </Label>
                  <Input
                    id="contactNumber"
                    value={form.contactNumber}
                    onChange={(e) => setValue('contactNumber', e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="bg-card"
                  />
                </div>
              </div>

              {/* Form Submission Actions */}
              <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={saving}
                  className="gap-2 shadow-md shadow-primary/20"
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : editing ? 'Update Professor' : 'Save New Professor'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
