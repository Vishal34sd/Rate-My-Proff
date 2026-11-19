import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Search,
  Star,
  Award,
  ShieldCheck,
  TrendingUp,
  BookOpen,
  Users,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  MessageSquare,
  Lock,
  ChevronRight,
  Filter,
  Check,
} from 'lucide-react'

import useFetch from '../utils/useFetch'
import { isLoggedIn, getRole } from '../utils/auth'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import ProfessorCard from '../components/ProfessorCard'
import { Skeleton } from '../components/ui/skeleton'

export default function LandingPage() {
  const navigate = useNavigate()
  const authed = isLoggedIn()
  const role = getRole()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDept, setSelectedDept] = useState('All')

  // Fetch real faculty data from backend
  const { data: professors, loading: profsLoading } = useFetch(
    'http://localhost:5000/api/professors',
    { initialData: [] },
  )

  // Extract unique departments
  const departments = useMemo(() => {
    if (!professors || !professors.length) return ['All']
    const depts = new Set(professors.map((p) => p.department).filter(Boolean))
    return ['All', ...Array.from(depts).sort()]
  }, [professors])

  // Filtered professors for search
  const filteredProfessors = useMemo(() => {
    if (!professors) return []
    return professors.filter((p) => {
      const matchSearch =
        !searchTerm.trim() ||
        p?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p?.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p?.subjects?.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchDept = selectedDept === 'All' || p?.department === selectedDept
      return matchSearch && matchDept
    })
  }, [professors, searchTerm, selectedDept])

  // Top rated professors for the Leaderboard
  const topProfessors = useMemo(() => {
    if (!professors || !professors.length) return []
    return [...professors]
      .filter((p) => (p.overallRating || 0) > 0)
      .sort((a, b) => (b.overallRating || 0) - (a.overallRating || 0))
      .slice(0, 3)
  }, [professors])

  const totalReviewsCount = useMemo(() => {
    if (!professors) return 0
    return professors.reduce((acc, p) => acc + (p.totalReviews || 0), 0)
  }, [professors])

  const dashboardTarget = role === 'admin' ? '/admin/dashboard' : '/student/dashboard'

  return (
    <div className="space-y-24 py-4 sm:py-8 overflow-hidden">
      {/* =========================================================================
          1. TWO-COLUMN HERO SECTION
         ========================================================================= */}
      <section className="relative pt-4 sm:pt-8 pb-10">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* ----------------- LEFT COLUMN: Introduction, Heading, Purpose, Quote, CTAs ----------------- */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Ambient Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary shadow-sm shadow-primary/10">
              <Sparkles size={14} className="text-amber-500 animate-pulse" />
              <span>KIET Academic Transparency & Feedback</span>
            </div>

            {/* Compelling Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-foreground">
              Know your professors before you{' '}
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-primary bg-clip-text text-transparent">
                choose your courses
              </span>
              .
            </h1>

            {/* Short Description Explaining the Purpose */}
            <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed max-w-2xl">
              Rate My Professor is KIET’s student-powered feedback portal. Read genuine, anonymous classroom evaluations on teaching clarity, lecture style, grading fairness, and mentorship from peers who sat in the lectures.
            </p>

            {/* Inspiring Quote */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="relative overflow-hidden rounded-2xl border-l-4 border-primary bg-card/80 p-4 sm:p-5 shadow-sm border border-border/80"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <blockquote className="text-base sm:text-lg font-bold italic text-foreground tracking-tight">
                    &ldquo;Better insights. Better choices. Better learning.&rdquo;
                  </blockquote>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Empowering every KIETian with open, honest, and respectful academic transparency.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Appropriate Call-To-Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {authed ? (
                <Button
                  size="lg"
                  onClick={() => navigate(dashboardTarget)}
                  className="shadow-lg shadow-orange-500/25 px-6 gap-2"
                >
                  Go to Student Dashboard <ArrowRight size={16} />
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="shadow-lg shadow-orange-500/25 px-6 gap-2 font-semibold"
                  >
                    Get Started as Student <ArrowRight size={16} />
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => navigate('/login')}
                    className="px-6 font-semibold"
                  >
                    Sign In
                  </Button>
                </>
              )}

              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  const el = document.getElementById('directory')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="px-5 gap-2"
              >
                <Search size={15} />
                Explore Directory
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-3 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-500 stroke-[3]" />
                100% Anonymous Reviews
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-500 stroke-[3]" />
                Verified @kiet.edu Emails
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-500 stroke-[3]" />
                Unbiased Classroom Insights
              </span>
            </div>
          </motion.div>

          {/* ----------------- RIGHT COLUMN: Animated Educational & Rating Illustration ----------------- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            className="lg:col-span-5 relative flex items-center justify-center"
          >
            {/* Ambient Background Glow Orbs */}
            <div className="absolute -top-12 -right-12 h-72 w-72 rounded-full bg-gradient-to-br from-orange-500/25 to-amber-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-gradient-to-tr from-amber-500/20 to-orange-600/10 blur-3xl pointer-events-none" />

            {/* Illustration Frame */}
            <div className="relative w-full max-w-md">
              {/* Floating Element 1: Student Review Quote Card (Top Offset) */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -right-2 sm:-right-4 z-20 rounded-2xl border border-border/80 bg-card/95 p-3.5 shadow-xl backdrop-blur-md max-w-[240px] hidden sm:block"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white text-[11px] font-bold">
                    VK
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Verified Student</p>
                    <div className="flex items-center text-amber-500 text-[10px]">
                      {'★'.repeat(5)}
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground leading-snug italic">
                  &ldquo;Explains algorithms with real-life analogies. Best prof for DSA!&rdquo;
                </p>
              </motion.div>

              {/* Floating Element 2: Verified KIET Badge (Top Left Offset) */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -top-4 -left-2 sm:-left-6 z-20 rounded-xl border border-primary/30 bg-card/95 px-3 py-1.5 shadow-lg backdrop-blur-md flex items-center gap-2"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
                  <ShieldCheck size={14} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">KIET Verified</p>
                  <p className="text-xs font-extrabold text-foreground">100% Anonymous</p>
                </div>
              </motion.div>

              {/* Main Feature Card: Professor Evaluation Profile */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="relative z-10 rounded-3xl border-2 border-border/80 bg-card/95 p-6 shadow-2xl backdrop-blur-xl space-y-5"
              >
                {/* Professor Header Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-400 text-white font-extrabold text-xl shadow-md shadow-orange-500/25">
                        <GraduationCap size={28} />
                      </div>
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-card">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-foreground">Dr. Rajiv Sharma</h2>
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500 border border-amber-500/20">
                          Top Faculty
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Professor • Computer Science & Engg
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                        <BookOpen size={12} className="text-primary" />
                        <span>Data Structures, Algorithms</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating Overview Box */}
                <div className="rounded-2xl border border-border/80 bg-muted/40 p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Overall Rating
                    </p>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl font-black text-foreground">4.9</span>
                      <span className="text-xs text-muted-foreground">/ 5.0</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={15} className="fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                      Based on 48 reviews
                    </p>
                  </div>
                </div>

                {/* Animated Attribute Bars */}
                <div className="space-y-2.5 pt-1">
                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Teaching Clarity</span>
                      <span className="text-primary font-bold">98%</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '98%' }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Approachability & Mentorship</span>
                      <span className="text-primary font-bold">94%</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '94%' }}
                        transition={{ duration: 1, delay: 0.45 }}
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Grading Fairness</span>
                      <span className="text-primary font-bold">91%</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '91%' }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer Badge */}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium text-emerald-500">
                    <CheckCircle2 size={13} /> 96% Would take again
                  </span>
                  <span className="font-semibold text-primary">Sample Review Card</span>
                </div>
              </motion.div>

              {/* Floating Element 3: Bottom Right Metric Pill */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-4 -right-2 sm:-right-4 z-20 rounded-xl border border-border/80 bg-card/95 px-3 py-2 shadow-xl backdrop-blur-md flex items-center gap-2"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Award size={15} />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">Campus Feedback</p>
                  <p className="text-xs font-bold text-foreground">Top 5% Faculty</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Metric Badges Strip */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-border/80 bg-card/60 p-4 text-center shadow-xs">
            <p className="text-2xl sm:text-3xl font-black text-foreground">
              {professors?.length || '40+'}
            </p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">Faculty Members</p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card/60 p-4 text-center shadow-xs">
            <p className="text-2xl sm:text-3xl font-black text-amber-500">
              {totalReviewsCount || '120+'}
            </p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">Student Reviews</p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card/60 p-4 text-center shadow-xs">
            <p className="text-2xl sm:text-3xl font-black text-primary">100%</p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">Anonymous & Safe</p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card/60 p-4 text-center shadow-xs">
            <p className="text-2xl sm:text-3xl font-black text-emerald-500">Verified</p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">KIET Community</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. INTERACTIVE SEARCH & LIVE FACULTY DIRECTORY
         ========================================================================= */}
      <section id="directory" className="scroll-mt-24 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20">
            <BookOpen size={13} />
            <span>Campus Faculty Directory</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Explore Faculty & Student Feedback
          </h2>
          <p className="text-sm text-muted-foreground">
            Search by professor name, department, or courses taught across semesters.
          </p>

          {/* Interactive Search Bar */}
          <div className="pt-2">
            <div className="relative flex items-center rounded-2xl border-2 border-border/80 bg-card/95 p-1.5 shadow-xl shadow-primary/5 transition-all duration-300 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
              <Search className="ml-3.5 text-muted-foreground" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search professor name, subject (e.g. DBMS, OS), or department..."
                className="flex-1 bg-transparent px-3 py-2 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="mr-2 text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg bg-muted cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Department Quick Filter Tags */}
            {departments.length > 1 && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs">
                <span className="text-muted-foreground mr-1 flex items-center gap-1">
                  <Filter size={12} /> Filter:
                </span>
                {departments.slice(0, 6).map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDept(dept)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                      selectedDept === dept
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
        </div>

        {/* Directory Grid */}
        {profsLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-60 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProfessors.slice(0, 6).map((professor) => (
              <ProfessorCard key={professor._id} professor={professor} />
            ))}

            {!filteredProfessors.length && (
              <div className="col-span-full rounded-2xl border border-border bg-card p-12 text-center space-y-3">
                <Users size={32} className="mx-auto text-muted-foreground" />
                <h3 className="text-base font-bold text-foreground">No professors matched your search</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting the keywords or resetting the department filter.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedDept('All')
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        )}

        {filteredProfessors.length > 6 && (
          <div className="text-center pt-4">
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate(authed ? dashboardTarget : '/register')}
              className="gap-2"
            >
              View All {filteredProfessors.length} Professors <ArrowRight size={15} />
            </Button>
          </div>
        )}
      </section>

      {/* =========================================================================
          3. FACULTY LEADERBOARD SECTION
         ========================================================================= */}
      <section id="leaderboard" className="scroll-mt-24 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Award size={14} />
            <span>Faculty Leaderboard</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Top Rated Professors
          </h2>
          <p className="text-sm text-muted-foreground">
            Recognizing faculty members with the highest student ratings for clarity, mentorship, and lecture excellence.
          </p>
        </div>

        {profsLoading ? (
          <div className="grid gap-6 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : topProfessors.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-3">
            {topProfessors.map((prof, index) => {
              const medals = ['🥇', '🥈', '🥉']
              const borders = [
                'border-amber-500/50 shadow-amber-500/10',
                'border-slate-400/40 shadow-slate-400/10',
                'border-amber-700/40 shadow-amber-700/10',
              ]

              return (
                <motion.div
                  key={prof._id}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => navigate(`/professor/${prof._id}`)}
                  className={`relative cursor-pointer rounded-2xl border-2 bg-card p-6 shadow-xl transition-all duration-300 hover:border-primary ${borders[index] || 'border-border'}`}
                >
                  {/* Rank Stamp */}
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{medals[index] || `#${index + 1}`}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-extrabold text-amber-500 border border-amber-500/30">
                      <Star size={12} className="fill-amber-500" />
                      {prof.overallRating?.toFixed(1) || '0.0'} / 5
                    </span>
                  </div>

                  <div className="mt-4 space-y-1">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary truncate">
                      {prof.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {prof.post || 'Faculty'} • {prof.department}
                    </p>
                  </div>

                  {prof.subjects?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {prof.subjects.slice(0, 2).map((s, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-semibold text-foreground/80 border border-border/50"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{prof.totalReviews || 0} reviews</span>
                    <span className="text-primary font-semibold flex items-center gap-0.5">
                      View Profile <ChevronRight size={13} />
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No rated professors yet. Be the first to submit a review!
          </div>
        )}
      </section>

      {/* =========================================================================
          4. CORE FEATURES SECTION
         ========================================================================= */}
      <section id="features" className="scroll-mt-24 space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20">
            <Sparkles size={14} />
            <span>Why Rate My Professor</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Built for Academic Transparency
          </h2>
          <p className="text-sm text-muted-foreground">
            A comprehensive feedback ecosystem providing clarity, insights, and honest student discourse.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover:border-primary/50 hover:shadow-lg transition-all group">
            <CardHeader className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <CardTitle className="text-lg">100% Student Anonymity</CardTitle>
              <CardDescription>
                Reviews are strictly anonymous. Express honest feedback about teaching quality without any concern of identity disclosure.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-primary/50 hover:shadow-lg transition-all group">
            <CardHeader className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                <BookOpen size={24} />
              </div>
              <CardTitle className="text-lg">Subject-Wise Analytics</CardTitle>
              <CardDescription>
                Understand how a faculty member teaches specific courses, lab subjects, and project guidance across different semesters.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-primary/50 hover:shadow-lg transition-all group">
            <CardHeader className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                <TrendingUp size={24} />
              </div>
              <CardTitle className="text-lg">Real Classroom Insights</CardTitle>
              <CardDescription>
                Get real perspectives on lecture clarity, notes quality, attendance leniency, assignment expectations, and exam preparation.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* =========================================================================
          5. HOW IT WORKS SECTION
         ========================================================================= */}
      <section id="how" className="scroll-mt-24 space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20">
            <CheckCircle2 size={14} />
            <span>Simple Workflow</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            How It Works in 3 Steps
          </h2>
          <p className="text-sm text-muted-foreground">
            Participate and discover valuable academic insights in seconds.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Find Your Professor',
              desc: 'Search our verified KIET faculty database by professor name, department, or subjects taught.',
              icon: Search,
            },
            {
              step: '02',
              title: 'Read Genuine Ratings',
              desc: 'Explore overall ratings, aggregate star metrics, and detailed comments left by students who attended lectures.',
              icon: Star,
            },
            {
              step: '03',
              title: 'Submit Anonymous Review',
              desc: 'Share your classroom feedback, rating score, and tips to help incoming students succeed.',
              icon: MessageSquare,
            },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div key={i} whileHover={{ y: -4 }}>
                <Card className="relative overflow-hidden border-border/80 h-full">
                  <div className="absolute top-4 right-4 text-4xl font-black text-muted/40 select-none">
                    {item.step}
                  </div>
                  <CardContent className="p-6 space-y-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* =========================================================================
          6. CTA BANNER
         ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-card via-primary/5 to-amber-500/10 p-8 sm:p-14 text-center shadow-xl">
        <div className="relative z-10 max-w-2xl mx-auto space-y-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20">
            <Lock size={12} /> Confidential & Peer-Powered
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Join the KIET Student Community
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground">
            Help build an honest, transparent academic environment. Read verified student reviews and share your own experiences.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={() => navigate(authed ? dashboardTarget : '/register')}
              className="w-full sm:w-auto shadow-lg shadow-primary/25"
            >
              {authed ? 'Open Student Dashboard' : 'Create Free Account'} <ArrowRight size={16} />
            </Button>
            {!authed && (
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
