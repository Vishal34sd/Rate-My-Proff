import React, { useState, useMemo } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  AlertTriangle,
  X,
  TrendingUp,
  MessageSquareQuote,
  Star,
  Award,
  Upload,
  BookOpen,
  Calendar,
  Filter,
  CheckCircle2,
  ThumbsUp,
  UserPlus,
} from 'lucide-react'

import { clearToken, getToken } from '../utils/auth'
import useFetch from '../utils/useFetch'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import ProfessorCard from '../components/ProfessorCard'
import AdminSidebar from '../components/AdminSidebar'
import LogoutModal from '../components/LogoutModal'
import RatingStars from '../components/RatingStars'

const EMPTY_FACULTY_FORM = {
  name: '',
  department: 'Computer Science & Engineering',
  post: 'Assistant Professor',
  qualification: 'M.Tech',
  experienceYears: '',
  officialEmail: '',
  contactNumber: '',
  subjects: '',
  sections: '',
}

const POPULAR_DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Electrical & Electronics',
  'Civil Engineering',
  'Applied Sciences',
  'MCA',
  'Pharmacy',
  'Management Studies',
]

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'directory'

  const setActiveTab = (tab) => {
    setSearchParams({ tab })
  }

  // ----------------------------------------------------
  // Data Fetching: Professors & All Student Reviews
  // ----------------------------------------------------
  const {
    data: professors,
    loading: profsLoading,
    error: profsError,
    refetch: refetchProfessors,
  } = useFetch('http://localhost:8080/api/professors', { initialData: [] })

  const {
    data: allReviews,
    loading: reviewsLoading,
  } = useFetch('http://localhost:8080/api/reviews/admin/all', { initialData: [] })

  // ----------------------------------------------------
  // State: Directory Filtering & Professor Deletion
  // ----------------------------------------------------
  const [search, setSearch] = useState('')
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // ----------------------------------------------------
  // State: Add Faculty Form
  // ----------------------------------------------------
  const [facultyForm, setFacultyForm] = useState(EMPTY_FACULTY_FORM)
  const [facultyImageFile, setFacultyImageFile] = useState(null)
  const [facultyImagePreview, setFacultyImagePreview] = useState('')
  const [savingFaculty, setSavingFaculty] = useState(false)

  // ----------------------------------------------------
  // State: Ratings Analytics Timeframe & Filters
  // ----------------------------------------------------
  const [ratingsPeriod, setRatingsPeriod] = useState('weekly') // 'weekly' | 'monthly' | 'all'
  const [ratingsSearch, setRatingsSearch] = useState('')
  const [ratingsDeptFilter, setRatingsDeptFilter] = useState('All')

  // ----------------------------------------------------
  // State: Student Feedbacks Filter
  // ----------------------------------------------------
  const [feedbackSearch, setFeedbackSearch] = useState('')
  const [feedbackProfessorFilter, setFeedbackProfessorFilter] = useState('All')
  const [feedbackStarFilter, setFeedbackStarFilter] = useState('All')
  const [feedbackDeptFilter, setFeedbackDeptFilter] = useState('All')

  // ----------------------------------------------------
  // Memoized: Unique Departments
  // ----------------------------------------------------
  const departments = useMemo(() => {
    if (!professors || !professors.length) return ['All']
    const depts = new Set(professors.map((p) => p.department).filter(Boolean))
    return ['All', ...Array.from(depts).sort()]
  }, [professors])

  // ----------------------------------------------------
  // Memoized: Directory Filtered Professors
  // ----------------------------------------------------
  const filteredProfessors = useMemo(() => {
    if (!professors) return []
    return professors.filter((p) => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.department?.toLowerCase().includes(q) ||
        p.subjects?.some((s) => s.toLowerCase().includes(q))

      const matchesDept =
        selectedDeptFilter === 'All' || p.department === selectedDeptFilter

      return matchesSearch && matchesDept
    })
  }, [professors, search, selectedDeptFilter])

  // ----------------------------------------------------
  // Memoized: Computed Weekly & Monthly Faculty Ratings
  // ----------------------------------------------------
  const periodAnalytics = useMemo(() => {
    const reviews = allReviews || []
    const now = new Date()

    // 7 days ago
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    // 30 days ago
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const weeklyReviews = reviews.filter((r) => new Date(r.createdAt) >= oneWeekAgo)
    const monthlyReviews = reviews.filter((r) => new Date(r.createdAt) >= oneMonthAgo)

    // Current period selection
    const activeReviews =
      ratingsPeriod === 'weekly'
        ? weeklyReviews
        : ratingsPeriod === 'monthly'
        ? monthlyReviews
        : reviews

    // Calculate per-professor stats for the active period
    const profRatingsMap = {}
    activeReviews.forEach((r) => {
      const profId = r.professor?._id || r.professor
      if (!profId) return
      if (!profRatingsMap[profId]) {
        profRatingsMap[profId] = {
          count: 0,
          totalRating: 0,
          ratings: [],
        }
      }
      profRatingsMap[profId].count += 1
      profRatingsMap[profId].totalRating += Number(r.rating || 0)
      profRatingsMap[profId].ratings.push(Number(r.rating || 0))
    })

    // Merge with all professors
    const facultyScores = (professors || []).map((prof) => {
      const stats = profRatingsMap[prof._id]
      const periodCount = stats?.count || 0
      const periodAvg = periodCount > 0 ? stats.totalRating / periodCount : 0
      return {
        ...prof,
        periodCount,
        periodAvg: Number(periodAvg.toFixed(1)),
        hasPeriodReviews: periodCount > 0,
      }
    })

    // Sort by periodAvg descending, then count descending
    facultyScores.sort((a, b) => b.periodAvg - a.periodAvg || b.periodCount - a.periodCount)

    // Aggregate stats
    const totalPeriodReviews = activeReviews.length
    const periodAvgOverall =
      totalPeriodReviews > 0
        ? (
            activeReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
            totalPeriodReviews
          ).toFixed(1)
        : '0.0'

    // Period rating distribution
    const ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    activeReviews.forEach((r) => {
      const val = Math.round(Number(r.rating || 0))
      if (val >= 1 && val <= 5) ratingDist[val]++
    })

    const topRatedInPeriod = facultyScores.find((f) => f.hasPeriodReviews) || null

    return {
      weeklyCount: weeklyReviews.length,
      monthlyCount: monthlyReviews.length,
      allCount: reviews.length,
      activeReviews,
      facultyScores,
      totalPeriodReviews,
      periodAvgOverall,
      ratingDist,
      topRatedInPeriod,
    }
  }, [allReviews, professors, ratingsPeriod])

  // Filtered Faculty Scores for Ratings Table
  const filteredFacultyScores = useMemo(() => {
    return periodAnalytics.facultyScores.filter((f) => {
      const q = ratingsSearch.trim().toLowerCase()
      const matchesSearch =
        !q ||
        f.name?.toLowerCase().includes(q) ||
        f.department?.toLowerCase().includes(q)

      const matchesDept =
        ratingsDeptFilter === 'All' || f.department === ratingsDeptFilter

      return matchesSearch && matchesDept
    })
  }, [periodAnalytics.facultyScores, ratingsSearch, ratingsDeptFilter])

  // ----------------------------------------------------
  // Memoized: Filtered Student Feedbacks
  // ----------------------------------------------------
  const filteredFeedbacks = useMemo(() => {
    const list = allReviews || []
    return list.filter((r) => {
      const profName = r.professor?.name || ''
      const profDept = r.professor?.department || ''
      const comment = r.comment || ''
      const subject = r.subject || ''

      const q = feedbackSearch.trim().toLowerCase()
      const matchesSearch =
        !q ||
        profName.toLowerCase().includes(q) ||
        comment.toLowerCase().includes(q) ||
        subject.toLowerCase().includes(q)

      const matchesProf =
        feedbackProfessorFilter === 'All' ||
        (r.professor?._id || r.professor) === feedbackProfessorFilter

      const matchesStar =
        feedbackStarFilter === 'All' ||
        Math.round(Number(r.rating || 0)) === Number(feedbackStarFilter)

      const matchesDept =
        feedbackDeptFilter === 'All' || profDept === feedbackDeptFilter

      return matchesSearch && matchesProf && matchesStar && matchesDept
    })
  }, [
    allReviews,
    feedbackSearch,
    feedbackProfessorFilter,
    feedbackStarFilter,
    feedbackDeptFilter,
  ])

  // ----------------------------------------------------
  // Handlers: Delete Professor
  // ----------------------------------------------------
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
      refetchProfessors()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to delete professor.')
    } finally {
      setDeleting(false)
    }
  }

  // ----------------------------------------------------
  // Handlers: Add Faculty Form
  // ----------------------------------------------------
  const handleFacultyFormChange = (key, value) => {
    setFacultyForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleFacultyImageChange = (e) => {
    const file = e.target.files?.[0] || null
    setFacultyImageFile(file)
    if (file) {
      setFacultyImagePreview(URL.createObjectURL(file))
    }
  }

  const handleCreateFaculty = async (e) => {
    e.preventDefault()
    if (!facultyForm.name.trim() || !facultyForm.department.trim()) {
      toast.error('Please provide professor name and department.')
      return
    }

    setSavingFaculty(true)
    try {
      const token = getToken()
      const formData = new FormData()
      formData.append('name', facultyForm.name.trim())
      formData.append('department', facultyForm.department.trim())
      if (facultyForm.post) formData.append('post', facultyForm.post.trim())
      if (facultyForm.qualification)
        formData.append('qualification', facultyForm.qualification.trim())
      if (facultyForm.experienceYears)
        formData.append('experienceYears', facultyForm.experienceYears)
      if (facultyForm.officialEmail)
        formData.append('officialEmail', facultyForm.officialEmail.trim())
      if (facultyForm.contactNumber)
        formData.append('contactNumber', facultyForm.contactNumber.trim())
      if (facultyForm.subjects) formData.append('subjects', facultyForm.subjects)
      if (facultyForm.sections) formData.append('sections', facultyForm.sections)
      if (facultyImageFile) formData.append('image', facultyImageFile)

      await axios.post('http://localhost:8080/api/professors', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      toast.success(`Faculty ${facultyForm.name} registered successfully!`)
      setFacultyForm(EMPTY_FACULTY_FORM)
      setFacultyImageFile(null)
      setFacultyImagePreview('')
      refetchProfessors()
      setActiveTab('directory')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to register faculty.')
    } finally {
      setSavingFaculty(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* =========================================================================
          LEFT SIDEBAR (AdminSidebar)
         ========================================================================= */}
      <AdminSidebar
        activeSection={activeTab}
        onSelectSection={setActiveTab}
        professorCount={professors?.length || 0}
      />

      {/* =========================================================================
          MAIN ADMIN DASHBOARD CONTENT AREA
         ========================================================================= */}
      <div className="flex-1 overflow-x-hidden p-4 md:p-8">
        <AnimatePresence mode="wait">
          {/* ---------------------------------------------------------------------
              TAB 1: FACULTY DIRECTORY MANAGEMENT
             --------------------------------------------------------------------- */}
          {activeTab === 'directory' && (
            <motion.div
              key="directory"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
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
                    onClick={() => setActiveTab('add-faculty')}
                    className="gap-2 shadow-md shadow-orange-500/20 bg-gradient-to-r from-orange-600 to-amber-500"
                  >
                    <Plus size={16} /> Add Professor
                  </Button>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
                  <div className="flex items-center justify-between text-muted-foreground mb-1">
                    <span className="text-xs font-medium">Total Faculty</span>
                    <Users size={16} className="text-primary" />
                  </div>
                  <p className="text-2xl font-black text-foreground">
                    {professors?.length || 0}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Listed professors</p>
                </div>

                <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
                  <div className="flex items-center justify-between text-muted-foreground mb-1">
                    <span className="text-xs font-medium">Departments</span>
                    <Building size={16} className="text-amber-500" />
                  </div>
                  <p className="text-2xl font-black text-foreground">
                    {Math.max(1, departments.length - 1)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Academic branches</p>
                </div>

                <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
                  <div className="flex items-center justify-between text-muted-foreground mb-1">
                    <span className="text-xs font-medium">Total Feedbacks</span>
                    <MessageSquareQuote size={16} className="text-orange-500" />
                  </div>
                  <p className="text-2xl font-black text-foreground">
                    {allReviews?.length || 0}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Student reviews</p>
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

              {/* Search & Department Filter Bar */}
              <div className="space-y-3">
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

                {departments.length > 1 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-muted-foreground mr-1 flex items-center gap-1">
                      <Filter size={12} /> Dept:
                    </span>
                    {departments.slice(0, 8).map((dept) => (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => setSelectedDeptFilter(dept)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                          selectedDeptFilter === dept
                            ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                            : 'bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {profsError ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {profsError}
                </div>
              ) : null}

              {/* Directory Grid */}
              {profsLoading ? (
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
                            onClick={() =>
                              navigate(`/admin/professors/${professor._id}/edit`)
                            }
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
            </motion.div>
          )}

          {/* ---------------------------------------------------------------------
              TAB 2: ADD FACULTY (Embedded Form)
             --------------------------------------------------------------------- */}
          {activeTab === 'add-faculty' && (
            <motion.div
              key="add-faculty"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              {/* Header */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20">
                    <UserPlus size={14} />
                    Faculty Registration
                  </span>
                </div>
                <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Add New Faculty Member
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Register a professor with their academic department, assigned subjects, and profile information.
                </p>
              </div>

              {/* Form Card */}
              <Card className="border-border/80 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Professor Details</CardTitle>
                  <CardDescription>
                    All registered details will appear in student searches and review submissions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateFaculty} className="space-y-6">
                    {/* Image Upload Row */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl border border-border/80 bg-muted/30">
                      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card overflow-hidden">
                        {facultyImagePreview ? (
                          <img
                            src={facultyImagePreview}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Upload className="text-muted-foreground" size={24} />
                        )}
                      </div>
                      <div className="space-y-1 text-center sm:text-left">
                        <label className="text-xs font-bold text-foreground">
                          Faculty Profile Picture
                        </label>
                        <p className="text-[11px] text-muted-foreground">
                          Upload high-resolution JPG or PNG portrait photo.
                        </p>
                        <div className="pt-1">
                          <input
                            type="file"
                            accept="image/*"
                            id="faculty-img-upload"
                            onChange={handleFacultyImageChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="faculty-img-upload"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer transition-colors shadow-xs"
                          >
                            <Upload size={13} />
                            {facultyImageFile ? 'Change Image' : 'Choose Photo'}
                          </label>
                          {facultyImageFile && (
                            <button
                              type="button"
                              onClick={() => {
                                setFacultyImageFile(null)
                                setFacultyImagePreview('')
                              }}
                              className="ml-2 text-xs text-destructive hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Basic Info: Name & Department */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Full Name <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={facultyForm.name}
                          onChange={(e) =>
                            handleFacultyFormChange('name', e.target.value)
                          }
                          placeholder="e.g. Dr. Rajiv Sharma"
                          className="h-10 w-full rounded-xl border border-border/80 bg-card px-3.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Department <span className="text-destructive">*</span>
                        </label>
                        <select
                          value={facultyForm.department}
                          onChange={(e) =>
                            handleFacultyFormChange('department', e.target.value)
                          }
                          className="h-10 w-full rounded-xl border border-border/80 bg-card px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        >
                          {POPULAR_DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Academic Role: Post & Qualification */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Designation / Post
                        </label>
                        <input
                          type="text"
                          value={facultyForm.post}
                          onChange={(e) =>
                            handleFacultyFormChange('post', e.target.value)
                          }
                          placeholder="e.g. Professor & Head of Department"
                          className="h-10 w-full rounded-xl border border-border/80 bg-card px-3.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Qualification
                        </label>
                        <input
                          type="text"
                          value={facultyForm.qualification}
                          onChange={(e) =>
                            handleFacultyFormChange('qualification', e.target.value)
                          }
                          placeholder="e.g. Ph.D (IIT Roorkee), M.Tech"
                          className="h-10 w-full rounded-xl border border-border/80 bg-card px-3.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    {/* Subjects & Sections */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Subjects Taught (comma separated)
                        </label>
                        <input
                          type="text"
                          value={facultyForm.subjects}
                          onChange={(e) =>
                            handleFacultyFormChange('subjects', e.target.value)
                          }
                          placeholder="e.g. Data Structures, Operating Systems, DBMS"
                          className="h-10 w-full rounded-xl border border-border/80 bg-card px-3.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Students can select these subjects when writing reviews.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Sections Assigned (comma separated)
                        </label>
                        <input
                          type="text"
                          value={facultyForm.sections}
                          onChange={(e) =>
                            handleFacultyFormChange('sections', e.target.value)
                          }
                          placeholder="e.g. CSE-1, CSE-2, CSE-3"
                          className="h-10 w-full rounded-xl border border-border/80 bg-card px-3.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    {/* Contact & Experience */}
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Experience (Years)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={facultyForm.experienceYears}
                          onChange={(e) =>
                            handleFacultyFormChange('experienceYears', e.target.value)
                          }
                          placeholder="e.g. 12"
                          className="h-10 w-full rounded-xl border border-border/80 bg-card px-3.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Official Institutional Email
                        </label>
                        <input
                          type="email"
                          value={facultyForm.officialEmail}
                          onChange={(e) =>
                            handleFacultyFormChange('officialEmail', e.target.value)
                          }
                          placeholder="name@kiet.edu"
                          className="h-10 w-full rounded-xl border border-border/80 bg-card px-3.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Contact Number
                        </label>
                        <input
                          type="text"
                          value={facultyForm.contactNumber}
                          onChange={(e) =>
                            handleFacultyFormChange('contactNumber', e.target.value)
                          }
                          placeholder="+91 98765 43210"
                          className="h-10 w-full rounded-xl border border-border/80 bg-card px-3.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    {/* Submit & Reset Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFacultyForm(EMPTY_FACULTY_FORM)
                          setFacultyImageFile(null)
                          setFacultyImagePreview('')
                        }}
                      >
                        Reset Form
                      </Button>
                      <Button
                        type="submit"
                        disabled={savingFaculty}
                        className="gap-2 shadow-md shadow-orange-500/25 bg-gradient-to-r from-orange-600 to-amber-500 font-semibold"
                      >
                        <CheckCircle2 size={16} />
                        {savingFaculty ? 'Registering Faculty...' : 'Save & Register Faculty'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ---------------------------------------------------------------------
              TAB 3: WEEKLY & MONTHLY FACULTY RATINGS
             --------------------------------------------------------------------- */}
          {activeTab === 'ratings' && (
            <motion.div
              key="ratings"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-8 max-w-6xl mx-auto"
            >
              {/* Header Banner */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <TrendingUp size={14} />
                      Academic Performance
                    </span>
                  </div>
                  <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    Weekly & Monthly Faculty Ratings
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Compare student rating trends across weekly, monthly, and cumulative academic cycles.
                  </p>
                </div>

                {/* Period Selector Tabs */}
                <div className="inline-flex items-center rounded-xl border border-border bg-card p-1 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setRatingsPeriod('weekly')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      ratingsPeriod === 'weekly'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Weekly (Last 7 Days)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRatingsPeriod('monthly')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      ratingsPeriod === 'monthly'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Monthly (Last 30 Days)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRatingsPeriod('all')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      ratingsPeriod === 'all'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    All-Time
                  </button>
                </div>
              </div>

              {/* Performance KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="p-4 space-y-1">
                    <div className="flex items-center justify-between text-primary">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {ratingsPeriod === 'weekly'
                          ? 'This Week Avg'
                          : ratingsPeriod === 'monthly'
                          ? 'This Month Avg'
                          : 'Overall Campus Avg'}
                      </span>
                      <Star size={16} className="fill-primary" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-foreground">
                      {periodAnalytics.periodAvgOverall}
                      <span className="text-xs font-medium text-muted-foreground ml-1">/ 5.0</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      From {periodAnalytics.totalPeriodReviews} period reviews
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Reviews in Period
                      </span>
                      <MessageSquareQuote size={16} className="text-amber-500" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-foreground">
                      {periodAnalytics.totalPeriodReviews}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {ratingsPeriod === 'weekly'
                        ? `${periodAnalytics.monthlyCount} reviews this month`
                        : `${periodAnalytics.weeklyCount} reviews this week`}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Top Rated Faculty
                      </span>
                      <Award size={16} className="text-amber-500" />
                    </div>
                    <p className="text-lg font-black text-foreground truncate">
                      {periodAnalytics.topRatedInPeriod?.name || 'N/A'}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {periodAnalytics.topRatedInPeriod
                        ? `${periodAnalytics.topRatedInPeriod.periodAvg} ★ (${periodAnalytics.topRatedInPeriod.department})`
                        : 'No reviews in period'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Period Window
                      </span>
                      <Calendar size={16} className="text-emerald-500" />
                    </div>
                    <p className="text-lg font-black text-emerald-500 capitalize">
                      {ratingsPeriod}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {ratingsPeriod === 'weekly'
                        ? 'Past 7 calendar days'
                        : ratingsPeriod === 'monthly'
                        ? 'Past 30 calendar days'
                        : 'All historical submissions'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Comparative Ratings Bar Chart Summary */}
              <div className="grid gap-6 md:grid-cols-3">
                {/* Rating Distribution Breakdown */}
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Rating Distribution</CardTitle>
                    <CardDescription className="text-xs">
                      Star rating breakdown for {ratingsPeriod} period
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = periodAnalytics.ratingDist[star] || 0
                      const total = periodAnalytics.totalPeriodReviews || 1
                      const pct = Math.round((count / total) * 100)

                      return (
                        <div key={star} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              {star} <Star size={11} className="fill-amber-500 text-amber-500" />
                            </span>
                            <span className="text-foreground">
                              {count} <span className="text-muted-foreground font-normal">({pct}%)</span>
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Faculty Ratings Leaderboard for Selected Period */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <CardTitle className="text-base font-bold">
                          Faculty Ratings Comparison
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Scores calculated strictly during the {ratingsPeriod} timeframe
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={ratingsDeptFilter}
                          onChange={(e) => setRatingsDeptFilter(e.target.value)}
                          className="h-8 rounded-lg border border-border bg-card px-2 text-xs text-foreground outline-none focus:border-primary cursor-pointer"
                        >
                          <option value="All">All Departments</option>
                          {departments
                            .filter((d) => d !== 'All')
                            .map((dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                        </select>
                        <input
                          type="text"
                          value={ratingsSearch}
                          onChange={(e) => setRatingsSearch(e.target.value)}
                          placeholder="Search faculty..."
                          className="h-8 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border/80 text-muted-foreground">
                            <th className="pb-2 font-semibold">Faculty</th>
                            <th className="pb-2 font-semibold">Department</th>
                            <th className="pb-2 font-semibold text-center">Period Reviews</th>
                            <th className="pb-2 font-semibold text-right">Rating Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {filteredFacultyScores.slice(0, 10).map((faculty, idx) => (
                            <tr key={faculty._id} className="hover:bg-muted/40 transition-colors">
                              <td className="py-2.5 font-medium text-foreground flex items-center gap-2">
                                <span className="text-[10px] font-bold text-muted-foreground w-4">
                                  #{idx + 1}
                                </span>
                                <div>
                                  <p className="font-semibold text-foreground truncate max-w-[160px]">
                                    {faculty.name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {faculty.post || 'Faculty'}
                                  </p>
                                </div>
                              </td>
                              <td className="py-2.5 text-muted-foreground">
                                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium border border-border/60">
                                  {faculty.department}
                                </span>
                              </td>
                              <td className="py-2.5 text-center font-bold text-foreground">
                                {faculty.periodCount}
                              </td>
                              <td className="py-2.5 text-right font-extrabold text-amber-500">
                                {faculty.hasPeriodReviews ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                                    <Star size={11} className="fill-amber-500 text-amber-500" />
                                    {faculty.periodAvg} / 5
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-muted-foreground font-normal">
                                    No reviews yet
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}

                          {!filteredFacultyScores.length && (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-muted-foreground">
                                No faculty records found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* ---------------------------------------------------------------------
              TAB 4: STUDENT FEEDBACKS REGARDING FACULTIES
             --------------------------------------------------------------------- */}
          {activeTab === 'feedbacks' && (
            <motion.div
              key="feedbacks"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 max-w-6xl mx-auto"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20">
                      <MessageSquareQuote size={14} />
                      Student Discourse
                    </span>
                  </div>
                  <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    Student Feedbacks Regarding Faculty
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Read genuine student evaluations, teaching ratings, and anonymous classroom comments.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                  Total Reviews:{' '}
                  <span className="font-extrabold text-foreground">
                    {allReviews?.length || 0}
                  </span>
                </div>
              </div>

              {/* Filters Toolbar */}
              <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
                <div className="grid gap-3 sm:grid-cols-3">
                  {/* Search Input */}
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={16}
                    />
                    <input
                      type="text"
                      value={feedbackSearch}
                      onChange={(e) => setFeedbackSearch(e.target.value)}
                      placeholder="Search comments, subjects..."
                      className="h-9 w-full rounded-xl border border-border/80 bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary"
                    />
                  </div>

                  {/* Faculty Filter Dropdown */}
                  <div>
                    <select
                      value={feedbackProfessorFilter}
                      onChange={(e) => setFeedbackProfessorFilter(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border/80 bg-background px-3 text-xs text-foreground outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="All">All Faculty Members</option>
                      {(professors || []).map((prof) => (
                        <option key={prof._id} value={prof._id}>
                          {prof.name} ({prof.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Star Filter Dropdown */}
                  <div>
                    <select
                      value={feedbackStarFilter}
                      onChange={(e) => setFeedbackStarFilter(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border/80 bg-background px-3 text-xs text-foreground outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="All">All Star Ratings</option>
                      <option value="5">5 Stars (Outstanding)</option>
                      <option value="4">4 Stars (Very Good)</option>
                      <option value="3">3 Stars (Average)</option>
                      <option value="2">2 Stars (Needs Work)</option>
                      <option value="1">1 Star (Challenging)</option>
                    </select>
                  </div>
                </div>

                {/* Quick Department Tags */}
                {departments.length > 1 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                    <span className="text-muted-foreground text-[11px] mr-1">Department:</span>
                    {departments.slice(0, 7).map((dept) => (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => setFeedbackDeptFilter(dept)}
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-all cursor-pointer ${
                          feedbackDeptFilter === dept
                            ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                            : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Feedbacks Grid */}
              {reviewsLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-44 rounded-2xl" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredFeedbacks.map((review) => {
                    const prof = review.professor || {}
                    const dateFormatted = review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Recent'

                    return (
                      <Card
                        key={review._id}
                        className="border-border/80 hover:border-primary/40 transition-all shadow-xs"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-bold text-xs shadow-xs">
                                {prof.name ? prof.name.slice(0, 2).toUpperCase() : 'PR'}
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-foreground">
                                  {prof.name || 'Faculty Member'}
                                </h3>
                                <p className="text-[11px] text-muted-foreground">
                                  {prof.department || 'Department'}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <RatingStars
                                value={review.rating || 0}
                                readOnly
                                size={14}
                              />
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {dateFormatted}
                              </p>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3 pt-0">
                          {/* Subject Pill */}
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <BookOpen size={12} className="text-primary" />
                            <span className="font-medium text-foreground">
                              {review.subject || 'General Coursework'}
                            </span>
                          </div>

                          {/* Comment Bubble */}
                          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs leading-relaxed text-foreground">
                            &ldquo;{review.comment || 'No written comment provided.'}&rdquo;
                          </div>

                          {/* 5 Parameters Tags */}
                          {(review.teachingQuality ||
                            review.subjectKnowledge ||
                            review.doubtResolution ||
                            review.fairnessInGrading ||
                            review.classEngagement) && (
                            <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                              {review.teachingQuality && (
                                <span className="rounded-md bg-muted px-2 py-0.5 font-medium border border-border/60">
                                  Teaching:{' '}
                                  <strong className="text-primary">
                                    {review.teachingQuality}/5
                                  </strong>
                                </span>
                              )}
                              {review.subjectKnowledge && (
                                <span className="rounded-md bg-muted px-2 py-0.5 font-medium border border-border/60">
                                  Knowledge:{' '}
                                  <strong className="text-primary">
                                    {review.subjectKnowledge}/5
                                  </strong>
                                </span>
                              )}
                              {review.doubtResolution && (
                                <span className="rounded-md bg-muted px-2 py-0.5 font-medium border border-border/60">
                                  Doubts:{' '}
                                  <strong className="text-primary">
                                    {review.doubtResolution}/5
                                  </strong>
                                </span>
                              )}
                              {review.fairnessInGrading && (
                                <span className="rounded-md bg-muted px-2 py-0.5 font-medium border border-border/60">
                                  Grading:{' '}
                                  <strong className="text-primary">
                                    {review.fairnessInGrading}/5
                                  </strong>
                                </span>
                              )}
                              {review.classEngagement && (
                                <span className="rounded-md bg-muted px-2 py-0.5 font-medium border border-border/60">
                                  Engagement:{' '}
                                  <strong className="text-primary">
                                    {review.classEngagement}/5
                                  </strong>
                                </span>
                              )}
                            </div>
                          )}

                          {/* Footer Info */}
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                            <span className="flex items-center gap-1 font-medium">
                              <ThumbsUp size={12} className="text-primary" />
                              {review.helpfulCount || 0} students found helpful
                            </span>

                            {prof._id && (
                              <button
                                type="button"
                                onClick={() => navigate(`/professor/${prof._id}`)}
                                className="text-primary hover:underline font-semibold cursor-pointer text-xs"
                              >
                                View Professor Profile →
                              </button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}

                  {!filteredFeedbacks.length && (
                    <div className="md:col-span-2 rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground space-y-2">
                      <MessageSquareQuote size={32} className="mx-auto text-muted-foreground/60" />
                      <p className="font-semibold text-foreground">No student feedbacks found</p>
                      <p className="text-xs">
                        Adjust your search keywords or filter settings to see student ratings.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* =========================================================================
          CUSTOM DELETE PROFESSOR MODAL
         ========================================================================= */}
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
                Are you sure you want to remove <strong>{deleteTarget.name}</strong> (
                {deleteTarget.department}) from the professor directory?
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

      {/* =========================================================================
          LOGOUT CONFIRMATION MODAL
         ========================================================================= */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          clearToken()
          setShowLogoutModal(false)
          navigate('/', { replace: true })
        }}
      />
    </div>
  )
}
