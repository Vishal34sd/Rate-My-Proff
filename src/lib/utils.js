import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const SCORE_KEYS = ['teaching', 'leniency', 'attendance', 'examChecking']

function createEmptyStats() {
  return {
    totalReviews: 0,
    averageOverall: 0,
    averageTeaching: 0,
    averageLeniency: 0,
    averageAttendance: 0,
    averageExamChecking: 0,
  }
}

function createEmptyTotals() {
  return {
    overall: 0,
    teaching: 0,
    leniency: 0,
    attendance: 0,
    examChecking: 0,
  }
}

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function averageOfReview(review) {
  const values = SCORE_KEYS.map((key) => review[key])
  const valid = values.filter((value) => Number.isFinite(value) && value > 0)

  if (!valid.length) return 0
  return valid.reduce((sum, value) => sum + value, 0) / valid.length
}

export function getProfessorStats(professor) {
  const totalReviews = professor.reviews.length

  if (!totalReviews) {
    return createEmptyStats()
  }

  const totals = professor.reviews.reduce(
    (acc, review) => {
      acc.overall += averageOfReview(review)
      acc.teaching += review.teaching || 0
      acc.leniency += review.leniency || 0
      acc.attendance += review.attendance || 0
      acc.examChecking += review.examChecking || 0
      return acc
    },
    createEmptyTotals(),
  )

  return {
    totalReviews,
    averageOverall: totals.overall / totalReviews,
    averageTeaching: totals.teaching / totalReviews,
    averageLeniency: totals.leniency / totalReviews,
    averageAttendance: totals.attendance / totalReviews,
    averageExamChecking: totals.examChecking / totalReviews,
  }
}

export function formatScore(score) {
  return Number.isFinite(score) ? score.toFixed(1) : '0.0'
}
