import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import ReviewCard from '../components/ReviewCard'
import RatingStars from '../components/RatingStars'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { useAppData } from '../lib/app-context'
import { formatScore, getProfessorStats } from '../lib/utils'

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-xl border border-(--ui-border) bg-(--ui-muted) p-3">
      <p className="text-xs text-(--ui-muted-text)">{label}</p>
      <p className="mt-1 text-lg font-semibold text-sky-600 dark:text-sky-300">{formatScore(value)}</p>
    </div>
  )
}

function ProfessorDetailPage() {
  const { id } = useParams()
  const { professors } = useAppData()

  const professor = professors.find((item) => item.id === id)

  if (!professor) {
    return (
      <Card>
        <CardContent className="space-y-4 p-6">
          <p className="text-(--ui-text)">Professor not found.</p>
          <Link to="/">
            <Button variant="secondary">Go back</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  const stats = getProfessorStats(professor)

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="mb-5">
        <Link to="/">
          <Button variant="ghost" className="pl-0">
            <ChevronLeft size={18} />
            Back to Home
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader className="grid gap-4 md:grid-cols-[180px_1fr]">
          <div className="h-44 overflow-hidden rounded-xl border border-(--ui-border)">
            <img src={professor.image} alt={professor.name} className="h-full w-full object-cover" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">{professor.name}</CardTitle>
            <p className="text-sm font-medium text-(--ui-muted-text)">{professor.post}</p>
            <div className="space-y-1 text-sm text-(--ui-muted-text)">
              <p>Teaching Experience: {professor.experience}</p>
              <p>Educational Qualification: {professor.qualification}</p>
              <p>Email: {professor.email}</p>
              <p>Phone: {professor.phone}</p>
            </div>
            <Link to="/review">
              <Button size="sm">Review Professor</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="text-sm text-(--ui-muted-text)">Overall</span>
            <span className="text-2xl font-bold text-sky-600 dark:text-sky-300">{formatScore(stats.averageOverall)}</span>
            <RatingStars value={Math.round(stats.averageOverall)} readOnly />
            <span className="text-sm text-(--ui-muted-text)">({stats.totalReviews} reviews)</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryItem label="Teaching" value={stats.averageTeaching} />
            <SummaryItem label="Leniency" value={stats.averageLeniency} />
            <SummaryItem label="Attendance" value={stats.averageAttendance} />
            <SummaryItem label="Exam Checking" value={stats.averageExamChecking} />
          </div>
        </CardContent>
      </Card>

      {professor.reviews.length ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="grid gap-4"
        >
          {professor.reviews.map((review) => (
            <motion.div
              key={review.id}
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
            >
              <ReviewCard review={review} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="rounded-2xl border border-(--ui-border) bg-(--ui-surface) p-6 text-center text-(--ui-muted-text)">
          No reviews yet.
        </div>
      )}
    </motion.div>
  )
}

export default ProfessorDetailPage
