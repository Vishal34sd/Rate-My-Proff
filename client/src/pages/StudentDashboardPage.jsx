import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Users,
  Star,
  BookOpen,
  Building2,
  Sparkles,
  Plus,
  ArrowRight,
  Award,
  TrendingUp,
  MessageSquareQuote,
  CheckCircle2,
  Calendar,
  Filter,
} from 'lucide-react'

import useFetch from '../utils/useFetch'
import DashboardSidebar from '../components/DashboardSidebar'
import ProfessorCard from '../components/ProfessorCard'
import SearchBar from '../components/SearchBar'
import RatingStars from '../components/RatingStars'
import { Skeleton } from '../components/ui/skeleton'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

// Register ChartJS plugins
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

export default function StudentDashboardPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'dashboard'

  const setActiveTab = (tab) => {
    setSearchParams({ tab })
  }

  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('All')
  const [sortBy, setSortBy] = useState('rating') // 'rating' | 'name' | 'reviews'

  // Data fetching
  const {
    data: professors,
    loading: profsLoading,
    error: profsError,
  } = useFetch('http://localhost:8080/api/professors', { initialData: [] })

  const {
    data: myReviews,
    loading: reviewsLoading,
    error: reviewsError,
  } = useFetch('http://localhost:8080/api/reviews/me', { initialData: [] })

  const {
    data: user,
    loading: userLoading,
  } = useFetch('http://localhost:8080/api/auth/me', { initialData: null })

  // Departments list for filters
  const departments = useMemo(() => {
    if (!professors || !professors.length) return ['All']
    const depts = new Set(professors.map((p) => p.department).filter(Boolean))
    return ['All', ...Array.from(depts).sort()]
  }, [professors])

  // Filtered and sorted professors
  const filteredProfessors = useMemo(() => {
    let list = (professors || []).filter((p) => {
      const matchesSearch =
        p?.name?.toLowerCase().includes(search.trim().toLowerCase()) ||
        p?.department?.toLowerCase().includes(search.trim().toLowerCase()) ||
        p?.subjects?.some((s) => s.toLowerCase().includes(search.trim().toLowerCase()))
      const matchesDept = selectedDept === 'All' || p?.department === selectedDept
      return matchesSearch && matchesDept
    })

    if (sortBy === 'rating') {
      list = [...list].sort((a, b) => (b.overallRating || 0) - (a.overallRating || 0))
    } else if (sortBy === 'reviews') {
      list = [...list].sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0))
    } else if (sortBy === 'name') {
      list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    }

    return list
  }, [professors, search, selectedDept, sortBy])

  // Aggregate metrics
  const stats = useMemo(() => {
    const totalProfessors = professors?.length || 0
    const totalReviews = (professors || []).reduce((acc, p) => acc + (p.totalReviews || 0), 0)
    const ratedProfs = (professors || []).filter((p) => (p.overallRating || 0) > 0)
    const avgRating = ratedProfs.length
      ? (
          ratedProfs.reduce((acc, p) => acc + (p.overallRating || 0), 0) / ratedProfs.length
        ).toFixed(1)
      : '0.0'

    return {
      totalProfessors,
      totalReviews,
      avgRating,
      deptCount: Math.max(1, departments.length - 1),
    }
  }, [professors, departments])

  // Chart data for Analytics
  const analyticsData = useMemo(() => {
    if (!professors || !professors.length) return null

    // Rating distribution buckets (5, 4, 3, 2, 1)
    const ratingBuckets = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    professors.forEach((p) => {
      const r = Math.round(p.overallRating || 0)
      if (r >= 1 && r <= 5) {
        ratingBuckets[r] = (ratingBuckets[r] || 0) + 1
      }
    })

    const ratingChartData = {
      labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
      datasets: [
        {
          label: 'Number of Professors',
          data: [
            ratingBuckets[5],
            ratingBuckets[4],
            ratingBuckets[3],
            ratingBuckets[2],
            ratingBuckets[1],
          ],
          backgroundColor: [
            'rgba(246, 130, 31, 0.9)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(252, 211, 77, 0.8)',
            'rgba(148, 163, 184, 0.7)',
            'rgba(239, 68, 68, 0.7)',
          ],
          borderRadius: 8,
        },
      ],
    }

    // Department Distribution
    const deptCounts = {}
    professors.forEach((p) => {
      const d = p.department || 'Other'
      deptCounts[d] = (deptCounts[d] || 0) + 1
    })

    const deptLabels = Object.keys(deptCounts)
    const deptChartData = {
      labels: deptLabels,
      datasets: [
        {
          data: Object.values(deptCounts),
          backgroundColor: [
            '#f6821f',
            '#3b82f6',
            '#10b981',
            '#8b5cf6',
            '#f59e0b',
            '#ec4899',
            '#06b6d4',
          ],
          borderWidth: 2,
          borderColor: 'transparent',
        },
      ],
    }

    // Top 3 professors
    const topProfessors = [...professors]
      .filter((p) => (p.overallRating || 0) > 0)
      .sort((a, b) => (b.overallRating || 0) - (a.overallRating || 0))
      .slice(0, 3)

    return {
      ratingChartData,
      deptChartData,
      topProfessors,
    }
  }, [professors])

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Animated Sidebar */}
      <DashboardSidebar
        activeSection={activeTab}
        onSelectSection={setActiveTab}
        reviewCount={myReviews?.length || 0}
        professorCount={professors?.length || 0}
        user={user}
      />

      {/* Main Dashboard Content Area */}
      <div className="flex-1 overflow-x-hidden p-4 md:p-8">
        <AnimatePresence mode="wait">
          {/* ======================= 1. DASHBOARD SECTION ======================= */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 max-w-6xl mx-auto"
            >
              {/* Header Banner */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
                      <Sparkles size={12} /> KIET Academic Portal
                    </span>
                  </div>
                  <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                    Student Dashboard
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Explore faculty ratings, read honest feedback, and evaluate your professors.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => navigate('/student/reviews/new')}
                    className="gap-2 shadow-md shadow-primary/20"
                  >
                    <Plus size={16} /> Add Review
                  </Button>
                </div>
              </div>

              {/* Metric KPI Cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <motion.div
                  whileHover={{ y: -3 }}
                  className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Professors</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Users size={16} />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {stats.totalProfessors}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Available for review</p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -3 }}
                  className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Avg Rating</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                      <Star size={16} className="fill-amber-500" />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">{stats.avgRating} / 5</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Faculty aggregate</p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -3 }}
                  className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">My Reviews</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                      <BookOpen size={16} />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {myReviews?.length || 0}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Submitted by you</p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -3 }}
                  className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Departments</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                      <Building2 size={16} />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">{stats.deptCount}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Academic branches</p>
                </motion.div>
              </div>

              {/* Search, Filter Pills & Sort Bar */}
              <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="w-full md:max-w-md">
                    <SearchBar
                      value={search}
                      onChange={setSearch}
                      placeholder="Search by professor name, subject, or department..."
                    />
                  </div>

                  {/* Sort Controls */}
                  <div className="flex items-center gap-2">
                    <Filter size={15} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-primary cursor-pointer"
                    >
                      <option value="rating">Highest Rating</option>
                      <option value="reviews">Most Reviews</option>
                      <option value="name">Name (A-Z)</option>
                    </select>
                  </div>
                </div>

                {/* Department Filter Chips */}
                {departments.length > 1 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-xs text-muted-foreground mr-1">Department:</span>
                    {departments.map((dept) => {
                      const isSelected = selectedDept === dept
                      return (
                        <button
                          key={dept}
                          type="button"
                          onClick={() => setSelectedDept(dept)}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-primary text-primary-foreground shadow-xs'
                              : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          {dept}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Error state */}
              {profsError && (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {profsError}
                </div>
              )}

              {/* Professors Grid */}
              {profsLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-44 rounded-2xl" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredProfessors.map((professor) => (
                    <ProfessorCard key={professor._id} professor={professor} />
                  ))}

                  {!filteredProfessors.length && (
                    <div className="md:col-span-2 rounded-2xl border border-border bg-card p-10 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
                        <Users size={24} />
                      </div>
                      <h3 className="text-base font-semibold text-foreground">
                        No professors found
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Try adjusting your search term or department filter.
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSearch('')
                          setSelectedDept('All')
                        }}
                        className="mt-4"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ======================= 2. REVIEW SECTION ======================= */}
          {activeTab === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 max-w-5xl mx-auto"
            >
              {/* Header */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
                      <MessageSquareQuote size={12} /> Student Feedback
                    </span>
                  </div>
                  <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                    My Reviews
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Track and manage all the professor reviews and ratings you have submitted.
                  </p>
                </div>

                <Button
                  onClick={() => navigate('/student/reviews/new')}
                  className="gap-2 shadow-md shadow-primary/20 self-start sm:self-auto"
                >
                  <Plus size={16} /> Write New Review
                </Button>
              </div>

              {/* Review Statistics Capsule */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Reviews Submitted</p>
                      <p className="text-xl font-bold text-foreground">
                        {myReviews?.length || 0}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                      <Star size={20} className="fill-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Average Rating Given</p>
                      <p className="text-xl font-bold text-foreground">
                        {myReviews?.length
                          ? (
                              myReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
                              myReviews.length
                            ).toFixed(1)
                          : '0.0'}{' '}
                        / 5
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Review Status</p>
                      <p className="text-xl font-bold text-foreground">Verified Student</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reviews List */}
              {reviewsError && (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {reviewsError}
                </div>
              )}

              {reviewsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-32 rounded-2xl" />
                  ))}
                </div>
              ) : myReviews?.length ? (
                <div className="space-y-4">
                  {myReviews.map((rev) => (
                    <Card
                      key={rev._id}
                      className="border-border hover:border-primary/50 transition-colors"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <CardTitle className="text-lg text-foreground">
                              {rev?.professor?.name || 'Professor'}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-0.5">
                              <span>{rev?.professor?.department || 'Department'}</span>
                              {rev?.subject && (
                                <>
                                  <span>•</span>
                                  <span className="text-foreground/80">{rev.subject}</span>
                                </>
                              )}
                            </CardDescription>
                          </div>

                          <div className="flex items-center gap-2">
                            <RatingStars value={rev.rating || 0} readOnly size={16} />
                            <span className="text-sm font-semibold text-primary">
                              {rev.rating}/5
                            </span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          "{rev.comment || 'No specific comments provided.'}"
                        </p>

                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/60 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar size={13} />
                            {rev.createdAt
                              ? new Date(rev.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'Recently'}
                          </span>

                          {rev?.professor?._id && (
                            <button
                              type="button"
                              onClick={() => navigate(`/professor/${rev.professor._id}`)}
                              className="text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
                            >
                              View Professor <ArrowRight size={13} />
                            </button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-border bg-card/60 p-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                    <MessageSquareQuote size={28} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">No reviews submitted yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
                    Share your experience with professors to help your peers choose the best
                    guidance.
                  </p>
                  <Button
                    onClick={() => navigate('/student/reviews/new')}
                    className="mt-5 gap-2 shadow-md shadow-primary/20"
                  >
                    <Plus size={16} /> Write First Review
                  </Button>
                </Card>
              )}
            </motion.div>
          )}

          {/* ======================= 3. ANALYTICS SECTION ======================= */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 max-w-5xl mx-auto"
            >
              {/* Header */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
                    <TrendingUp size={12} /> Faculty Performance
                  </span>
                </div>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                  Academic Analytics
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  In-depth insights, score breakdowns, and department distribution across campus.
                </p>
              </div>

              {/* KPI Highlights */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Top Rated Faculty
                      </p>
                      <Award size={18} className="text-primary" />
                    </div>
                    <p className="mt-2 text-2xl font-extrabold text-foreground">
                      {analyticsData?.topProfessors?.[0]?.name || 'N/A'}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Rating:{' '}
                      <span className="font-semibold text-primary">
                        {analyticsData?.topProfessors?.[0]?.overallRating?.toFixed(1) || '0.0'} / 5
                      </span>{' '}
                      • {analyticsData?.topProfessors?.[0]?.department || ''}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Total Faculty Analyzed
                    </p>
                    <p className="mt-2 text-2xl font-extrabold text-foreground">
                      {stats.totalProfessors}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Across {stats.deptCount} departments
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Campus Rating Index
                    </p>
                    <p className="mt-2 text-2xl font-extrabold text-foreground">
                      {stats.avgRating} <span className="text-sm font-normal text-muted-foreground">/ 5</span>
                    </p>
                    <p className="mt-1 text-xs text-emerald-500 flex items-center gap-1 font-medium">
                      <TrendingUp size={13} /> Active Student Community
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Bar Chart: Rating Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-foreground">
                      Rating Distribution
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Number of faculty members per rating level
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analyticsData?.ratingChartData ? (
                      <div className="h-64">
                        <Bar
                          data={analyticsData.ratingChartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                backgroundColor: '#18181b',
                                titleColor: '#ffffff',
                                bodyColor: '#ffffff',
                                borderColor: '#f6821f',
                                borderWidth: 1,
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: { precision: 0, color: '#a1a1aa' },
                                grid: { color: 'rgba(161, 161, 170, 0.1)' },
                              },
                              x: {
                                ticks: { color: '#a1a1aa' },
                                grid: { display: false },
                              },
                            },
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                        Loading charts...
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Doughnut Chart: Department Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-foreground">
                      Department Share
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Professors listed by academic department
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analyticsData?.deptChartData ? (
                      <div className="h-64 flex items-center justify-center">
                        <Doughnut
                          data={analyticsData.deptChartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'right',
                                labels: { color: '#a1a1aa', boxWidth: 12, font: { size: 11 } },
                              },
                            },
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                        Loading charts...
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Spotlight: Highest Rated Professors */}
              {analyticsData?.topProfessors?.length ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Award size={20} className="text-primary" /> Top Rated Professors Spotlight
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {analyticsData.topProfessors.map((p, idx) => (
                      <Card
                        key={p._id}
                        className="cursor-pointer hover:border-primary transition-all group"
                        onClick={() => navigate(`/professor/${p._id}`)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                              #{idx + 1}
                            </span>
                            <div className="flex items-center gap-1 text-primary font-bold text-sm">
                              <Star size={14} className="fill-primary" />
                              {p.overallRating?.toFixed(1) || '0.0'}
                            </div>
                          </div>
                          <CardTitle className="text-base mt-2 group-hover:text-primary transition-colors">
                            {p.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {p.department || 'Department'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 text-xs text-muted-foreground">
                          {p.subjects?.slice(0, 2).join(', ') || 'Faculty'}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}

          {/* ======================= 4. PROFILE SECTION ======================= */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 max-w-4xl mx-auto"
            >
              {/* Header */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
                    <CheckCircle2 size={12} /> Student Account
                  </span>
                </div>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                  Student Profile
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage your academic identity and account information.
                </p>
              </div>

              {userLoading ? (
                <Skeleton className="h-64 rounded-2xl" />
              ) : (
                <div className="space-y-6">
                  {/* Main Profile Card */}
                  <Card className="overflow-hidden border-border">
                    <div className="h-28 bg-gradient-to-r from-primary/30 via-amber-500/20 to-orange-500/30 p-6 flex items-end">
                      <div className="translate-y-8 flex items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-card bg-primary text-2xl font-black text-primary-foreground shadow-xl">
                          {(user?.name || 'S').trim().slice(0, 1).toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <CardContent className="pt-12 pb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">
                            {user?.name || 'Student Name'}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {user?.email || 'student@kiet.edu'}
                          </p>
                        </div>

                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 self-start sm:self-auto">
                          Role: {user?.role || 'student'}
                        </span>
                      </div>

                      {/* Detail Grid */}
                      <div className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
                        <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                          <span className="text-xs text-muted-foreground">Department</span>
                          <p className="mt-0.5 font-semibold text-foreground">
                            {user?.department || 'Information Technology'}
                          </p>
                        </div>

                        <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                          <span className="text-xs text-muted-foreground">Registration No.</span>
                          <p className="mt-0.5 font-semibold text-foreground">
                            {user?.registrationNumber || '2100290130000'}
                          </p>
                        </div>

                        <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                          <span className="text-xs text-muted-foreground">Semester</span>
                          <p className="mt-0.5 font-semibold text-foreground">
                            {user?.semester ? `Semester ${user.semester}` : 'Semester 6'}
                          </p>
                        </div>

                        <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                          <span className="text-xs text-muted-foreground">Section</span>
                          <p className="mt-0.5 font-semibold text-foreground">
                            {user?.section || 'Section A'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Activity Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold text-foreground">
                        Account Activity & Contributions
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Your engagement on the Rate My Professor platform
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 sm:grid-cols-3 text-center">
                        <div className="rounded-xl border border-border p-4">
                          <p className="text-2xl font-bold text-primary">
                            {myReviews?.length || 0}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">Reviews Written</p>
                        </div>

                        <div className="rounded-xl border border-border p-4">
                          <p className="text-2xl font-bold text-amber-500">
                            {myReviews?.length
                              ? (
                                  myReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
                                  myReviews.length
                                ).toFixed(1)
                              : '0.0'}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">Avg Rating Given</p>
                        </div>

                        <div className="rounded-xl border border-border p-4">
                          <p className="text-2xl font-bold text-emerald-500">Active</p>
                          <p className="mt-1 text-xs text-muted-foreground">Student Status</p>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('review')}
                          className="gap-2"
                        >
                          <MessageSquareQuote size={15} /> View My Reviews
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => navigate('/student/reviews/new')}
                          className="gap-2"
                        >
                          <Plus size={15} /> Write a Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
