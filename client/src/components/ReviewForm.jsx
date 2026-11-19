import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import {
  Sparkles,
  Info,
  Send,
  Star,
  GraduationCap,
  BookOpen,
  HelpCircle,
  Scale,
  Users,
} from 'lucide-react'

import RatingStars from './RatingStars'
import { getToken } from '../utils/auth'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Textarea } from './ui/textarea'

// 5 Faculty Rating Parameters (1 = Poor, 5 = Excellent)
const RATING_PARAMETERS = [
  {
    key: 'teachingQuality',
    label: 'Teaching Quality',
    icon: GraduationCap,
    desc: 'Clarity of lectures, explanation style, and structured delivery',
  },
  {
    key: 'subjectKnowledge',
    label: 'Subject Knowledge',
    icon: BookOpen,
    desc: 'Depth of curriculum expertise, real-world examples, and domain mastery',
  },
  {
    key: 'doubtResolution',
    label: 'Doubt Resolution',
    icon: HelpCircle,
    desc: 'Patience, availability after lectures, and clear problem solving',
  },
  {
    key: 'fairnessInGrading',
    label: 'Fairness in Grading',
    icon: Scale,
    desc: 'Transparent marking criteria, unbiased evaluation, and helpful feedback',
  },
  {
    key: 'classEngagement',
    label: 'Class Engagement',
    icon: Users,
    desc: 'Interactive discussions, encouraging student participation, and focus',
  },
]

const initialForm = {
  professorId: '',
  subject: '',
  teachingQuality: 0,
  subjectKnowledge: 0,
  doubtResolution: 0,
  fairnessInGrading: 0,
  classEngagement: 0,
  rating: 0,
  comment: '',
}

function ReviewForm({ professors = [], defaultProfessorId = '', onSubmitted }) {
  const [form, setForm] = useStateWithDefaults(defaultProfessorId)
  const [submitting, setSubmitting] = useState(false)

  const selectedProfessor =
    professors.find((p) => p._id === form.professorId) ||
    (defaultProfessorId && professors.length === 1 ? professors[0] : null)

  const availableSubjects = selectedProfessor?.subjects || []

  const setValue = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleParamChange = (key, val) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: val }
      const pValues = [
        updated.teachingQuality,
        updated.subjectKnowledge,
        updated.doubtResolution,
        updated.fairnessInGrading,
        updated.classEngagement,
      ].filter((x) => x > 0)

      if (pValues.length > 0) {
        const avg = pValues.reduce((a, b) => a + b, 0) / pValues.length
        updated.rating = Number(avg.toFixed(1))
      }
      return updated
    })
  }

  const validate = () => {
    if (!form.professorId) return 'Please select a professor to review.'
    if (!form.subject?.trim()) return 'Please select or enter a subject.'
    if (!form.teachingQuality) return 'Please rate Teaching Quality (1-5 stars).'
    if (!form.subjectKnowledge) return 'Please rate Subject Knowledge (1-5 stars).'
    if (!form.doubtResolution) return 'Please rate Doubt Resolution (1-5 stars).'
    if (!form.fairnessInGrading) return 'Please rate Fairness in Grading (1-5 stars).'
    if (!form.classEngagement) return 'Please rate Class Engagement (1-5 stars).'
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const error = validate()
    if (error) {
      toast.error(error)
      return
    }

    setSubmitting(true)
    try {
      // Backend: POST /api/reviews
      const token = getToken()
      await axios.post(
        'http://localhost:8080/api/reviews',
        {
          professorId: form.professorId,
          subject: form.subject.trim(),
          teachingQuality: form.teachingQuality,
          subjectKnowledge: form.subjectKnowledge,
          doubtResolution: form.doubtResolution,
          fairnessInGrading: form.fairnessInGrading,
          classEngagement: form.classEngagement,
          rating: form.rating,
          comment: form.comment.trim(),
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      )

      toast.success('Your anonymous review has been submitted!')
      setForm((prev) => ({
        ...prev,
        subject: '',
        teachingQuality: 0,
        subjectKnowledge: 0,
        doubtResolution: 0,
        fairnessInGrading: 0,
        classEngagement: 0,
        rating: 0,
        comment: '',
      }))
      onSubmitted?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  // Check if a professor is already selected or pre-defined
  const isProfessorPreselected = Boolean(defaultProfessorId || form.professorId)

  return (
    <Card className="border-border/80 bg-card/95 shadow-lg backdrop-blur-sm">
      <CardHeader className="space-y-2 border-b border-border/60 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
            <Sparkles size={12} /> Confidential Review
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Daily Lecture • {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
          Rate & Review Faculty
        </CardTitle>
        <CardDescription className="text-sm">
          Daily feedback resets every day. Rate your professor's lecture today across all 5 key academic dimensions.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Guidelines alert box */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground">
          <Info size={16} className="text-primary shrink-0 mt-0.5" />
          <p>
            Please rate honestly from <strong>1 star (Poor)</strong> to <strong>5 stars (Excellent)</strong>.
            Your feedback directly helps fellow students make informed decisions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Professor Selection / Preselected Display */}
          {defaultProfessorId && selectedProfessor ? (
            /* When reviewing directly from professor detail page: do not show dropdown at all */
            <div className="flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <GraduationCap size={15} />
              </div>
              <p className="text-muted-foreground">
                Reviewing Faculty:{' '}
                <strong className="text-foreground">{selectedProfessor.name}</strong>{' '}
                <span className="text-muted-foreground/80">
                  ({selectedProfessor.department || 'KIET'})
                </span>
              </p>
            </div>
          ) : isProfessorPreselected && selectedProfessor ? (
            /* When professor is selected on general review page: collapse into selected badge */
            <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/30 px-4 py-2.5 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <GraduationCap size={15} />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {selectedProfessor.name}{' '}
                    <span className="text-muted-foreground font-normal">
                      ({selectedProfessor.department})
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setValue('professorId', '')
                  setValue('subject', '')
                }}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Change Faculty
              </button>
            </div>
          ) : (
            /* Only ask for professor name if no professor has been selected yet */
            <div className="space-y-2">
              <Label htmlFor="professorId" className="flex items-center gap-1.5 font-semibold text-foreground">
                <GraduationCap size={15} className="text-primary" />
                Select Professor *
              </Label>
              <Select
                id="professorId"
                value={form.professorId}
                onChange={(event) => {
                  setValue('professorId', event.target.value)
                  setValue('subject', '')
                }}
                className="bg-card"
              >
                <option value="">-- Choose a professor from directory --</option>
                {professors.map((professor) => (
                  <option key={professor._id} value={professor._id}>
                    {professor.name} ({professor.department || 'General'})
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* 2. Course / Subject Selection (Taught by this faculty) */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="flex items-center gap-1.5 font-semibold text-foreground">
              <BookOpen size={15} className="text-primary" />
              Select Course / Subject Taught *
            </Label>
            {availableSubjects.length > 0 ? (
              <Select
                id="subject"
                value={form.subject}
                onChange={(event) => setValue('subject', event.target.value)}
                disabled={!form.professorId}
                className="bg-card"
              >
                <option value="">-- Choose course taught by this faculty --</option>
                {availableSubjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </Select>
            ) : (
              <input
                id="subject"
                type="text"
                required
                value={form.subject}
                onChange={(event) => setValue('subject', event.target.value)}
                disabled={!form.professorId}
                placeholder="Enter subject name taught by this faculty (e.g. DBMS, OS)..."
                className="h-10 w-full rounded-xl border border-border/80 bg-card px-3.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            )}
            {!form.professorId ? (
              <p className="text-xs text-muted-foreground">
                Select a professor to view subjects taught.
              </p>
            ) : null}
          </div>

          {/* 3. 5 Faculty Rating Parameters (1–5 Stars: 1 = Poor, 5 = Excellent) */}
          <div className="space-y-4 rounded-2xl border border-border/80 bg-muted/20 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-border/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Faculty Rating Parameters
                </h3>
                <p className="text-xs text-muted-foreground">
                  Rate each parameter from 1 (Poor) to 5 (Excellent)
                </p>
              </div>
              <span className="text-[11px] font-semibold text-primary">
                1 = Poor • 5 = Excellent
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {RATING_PARAMETERS.map((param) => {
                const Icon = param.icon
                const currentVal = form[param.key] || 0

                return (
                  <div
                    key={param.key}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 rounded-xl border border-border/60 bg-card p-3 shadow-2xs hover:border-primary/40 transition-colors"
                  >
                    <div className="space-y-0.5 max-w-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon size={14} />
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          {param.label} <span className="text-destructive">*</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground pl-8">
                        {param.desc}
                      </p>
                    </div>

                    <div className="pl-8 sm:pl-0 flex items-center gap-2 shrink-0">
                      <RatingStars
                        value={currentVal}
                        onChange={(value) => handleParamChange(param.key, value)}
                        size={20}
                        showLabel={true}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Calculated Overall Rating Summary Card */}
            <div className="mt-3 flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs">
              <div className="flex items-center gap-2">
                <Star size={16} className="fill-amber-500 text-amber-500" />
                <div>
                  <span className="font-bold text-foreground">
                    Calculated Overall Rating:
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Average of the 5 parameters above
                  </p>
                </div>
              </div>

              <div className="flex items-baseline gap-1 text-right">
                <span className="text-xl font-black text-foreground">
                  {form.rating > 0 ? form.rating.toFixed(1) : '—'}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">/ 5.0</span>
              </div>
            </div>
          </div>

          {/* 4. Classroom Experience & Comments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="comment" className="font-semibold text-foreground">
                Classroom Experience & Comments (Optional)
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {form.comment.length} characters
              </span>
            </div>
            <Textarea
              id="comment"
              value={form.comment}
              onChange={(event) => setValue('comment', event.target.value)}
              placeholder="How are lectures delivered? Are doubts cleared easily? Any tips for upcoming semester students?"
              className="min-h-24 bg-card"
            />
          </div>

          {/* 5. Submit Button (Small, Reduced Width, Centered in Middle) */}
          <div className="flex justify-center pt-2">
            <Button
              type="submit"
              size="default"
              className="w-auto min-w-[200px] px-8 gap-2 shadow-md shadow-primary/20 font-semibold cursor-pointer"
              disabled={submitting}
            >
              {submitting ? (
                <>Submitting Review...</>
              ) : (
                <>
                  <Send size={15} /> Submit Anonymous Review
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function useStateWithDefaults(defaultProfessorId) {
  const [prevDefaultId, setPrevDefaultId] = useState(defaultProfessorId)
  const [state, setState] = useState(() => ({
    ...initialForm,
    professorId: defaultProfessorId || '',
  }))

  if (defaultProfessorId && defaultProfessorId !== prevDefaultId) {
    setPrevDefaultId(defaultProfessorId)
    setState((prev) => ({ ...prev, professorId: defaultProfessorId }))
  }

  return [state, setState]
}

export default ReviewForm
