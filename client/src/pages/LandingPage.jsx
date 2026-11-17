import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
    'http://localhost:8080/api/professors',
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
          1. HERO SECTION
         ========================================================================= */}
      <section id="about" className="relative scroll-mt-28 pt-4 pb-8 text-center space-y-8 max-w-4xl mx-auto">
        {/* Ambient Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary shadow-sm shadow-primary/10"
        >
          <Sparkles size={14} className="text-amber-500 animate-pulse" />
          <span>KIET Academic Transparency & Feedback Platform</span>
        </motion.div>

        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-foreground">
            Know your <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-primary bg-clip-text text-transparent">
              professors better
            </span>
            .
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed">
            Real classroom feedback from students who sat in the lectures. Evaluate teaching clarity, grading fairness, and course expectations with complete anonymity.
          </p>
        </motion.div>

        {/* Interactive Search Bar on Homepage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto relative group"
        >
          <div className="relative flex items-center rounded-2xl border-2 border-border/80 bg-card/95 p-1.5 shadow-xl shadow-primary/5 transition-all duration-300 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
            <Search className="ml-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by professor name, subject (e.g. DBMS, OS), or department..."
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
            <Button
              onClick={() => {
                const el = document.getElementById('directory')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="hidden sm:inline-flex"
            >
              Search
            </Button>
          </div>

          {/* Department Quick Filter Tags */}
          {departments.length > 1 && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs">
              <span className="text-muted-foreground mr-1">Popular:</span>
              {departments.slice(0, 5).map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => {
                    setSelectedDept(dept)
                    const el = document.getElementById('directory')
                    el?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className={`rounded-full px-2.5 py-0.5 font-medium transition-all cursor-pointer ${
                    selectedDept === dept
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* CTA Buttons & Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
        >
          {authed ? (
            <Button size="lg" onClick={() => navigate(dashboardTarget)} className="w-full sm:w-auto shadow-md">
              Go to Dashboard <ArrowRight size={16} />
            </Button>
          ) : (
            <>
              <Button size="lg" onClick={() => navigate('/register')} className="w-full sm:w-auto shadow-md">
                Get Started as Student <ArrowRight size={16} />
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate('/login')} className="w-full sm:w-auto">
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
            className="w-full sm:w-auto"
          >
            Explore Directory
          </Button>
        </motion.div>

        {/* Metric Badges Strip */}
        <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <div className="rounded-2xl border border-border/80 bg-card/60 p-3 text-center">
            <p className="text-xl sm:text-2xl font-extrabold text-foreground">
              {professors?.length || '40+'}
            </p>
            <p className="text-xs text-muted-foreground">Faculty Members</p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card/60 p-3 text-center">
            <p className="text-xl sm:text-2xl font-extrabold text-amber-500">
              {totalReviewsCount || '120+'}
            </p>
            <p className="text-xs text-muted-foreground">Student Reviews</p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card/60 p-3 text-center">
            <p className="text-xl sm:text-2xl font-extrabold text-primary">100%</p>
            <p className="text-xs text-muted-foreground">Anonymous & Safe</p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card/60 p-3 text-center">
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-500">Verified</p>
            <p className="text-xs text-muted-foreground">KIET Community</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. FACULTY LEADERBOARD SECTION
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
          3. LIVE PROFESSOR SEARCH & DIRECTORY PREVIEW
         ========================================================================= */}
      <section id="directory" className="scroll-mt-24 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20">
              <BookOpen size={13} />
              <span>Campus Directory</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Explore Faculty & Reviews
            </h2>
            <p className="text-sm text-muted-foreground">
              Search by professor name, branch, or course subjects taught.
            </p>
          </div>

          {/* Department Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Filter size={14} className="text-muted-foreground mr-1" />
            {departments.slice(0, 6).map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  selectedDept === dept
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-card border border-border/80 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {dept}
              </button>
            ))}
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
          4. CORE FEATURES SECTION
         ========================================================================= */}
      <section id="features" className="scroll-mt-24 space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20">
            <Sparkles size={14} />
            <span>Why Rate My Proff</span>
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
