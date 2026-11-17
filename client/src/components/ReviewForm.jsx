import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import {
  Sparkles,
  Info,
  Send,
  Star,
  CheckCircle2,
  GraduationCap,
  BookOpen,
} from 'lucide-react'

import RatingStars from './RatingStars'
import { getToken } from '../utils/auth'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Textarea } from './ui/textarea'

const initialForm = {
  professorId: '',
  subject: '',
  rating: 0,
  comment: '',
}

function ReviewForm({ professors = [], defaultProfessorId = '', onSubmitted }) {
  const [form, setForm] = useStateWithDefaults(defaultProfessorId)
  const [submitting, setSubmitting] = useState(false)

  const selectedProfessor = professors.find((p) => p._id === form.professorId) || null
  const availableSubjects = selectedProfessor?.subjects || []

  const setValue = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const validate = () => {
    if (!form.professorId) return 'Please select a professor to review.'
    if (!form.subject) return 'Please choose a subject.'
    if (!form.rating) return 'Please select a star rating (1 to 5 stars).'
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
          subject: form.subject,
          rating: form.rating,
          comment: form.comment.trim(),
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      )

      toast.success('Your anonymous review has been submitted!')
      setForm((prev) => ({ ...prev, rating: 0, comment: '' }))
      onSubmitted?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="border-border/80 bg-card/95 shadow-lg backdrop-blur-sm">
      <CardHeader className="space-y-2 border-b border-border/60 pb-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
            <Sparkles size={12} /> Confidential Review
          </span>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
          Rate & Review Faculty
        </CardTitle>
        <CardDescription className="text-sm">
          Your feedback is 100% anonymous. Be constructive and share details about lectures,
          teaching clarity, and assignments.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Guidelines alert box */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground">
          <Info size={16} className="text-primary shrink-0 mt-0.5" />
          <p>
            Please adhere to respectful academic discourse. Mention teaching pacing, subject clarity,
            and real classroom takeaways to help your peers make well-informed decisions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Professor Select */}
          <div className="space-y-2">
            <Label htmlFor="professorId" className="flex items-center gap-1.5">
              <GraduationCap size={14} className="text-primary" />
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

          {/* Subject Select */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="flex items-center gap-1.5">
              <BookOpen size={14} className="text-primary" />
              Select Course / Subject *
            </Label>
            <Select
              id="subject"
              value={form.subject}
              onChange={(event) => setValue('subject', event.target.value)}
              disabled={!form.professorId}
              className="bg-card"
            >
              <option value="">
                {form.professorId
                  ? '-- Choose subject taught --'
                  : 'Select a professor first'}
              </option>
              {availableSubjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </Select>
            {!form.professorId ? (
              <p className="text-xs text-muted-foreground">
                Subjects will appear automatically based on professor selected above.
              </p>
            ) : null}
          </div>

          {/* Star Rating Section */}
          <div className="space-y-2.5 rounded-xl border border-border/70 bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="rating" className="flex items-center gap-1.5">
                <Star size={14} className="text-amber-500 fill-amber-500" />
                Overall Rating *
              </Label>
              <span className="text-xs font-semibold text-primary">
                {form.rating > 0 ? `${form.rating} out of 5 stars` : 'Select a rating'}
              </span>
            </div>

            <div className="py-1">
              <RatingStars
                value={form.rating}
                onChange={(value) => setValue('rating', value)}
                size={26}
                showLabel={true}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Hover over stars to preview and click to confirm your rating score.
            </p>
          </div>

          {/* Comment / Detailed Review */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="comment">Classroom Experience & Comments (Optional)</Label>
              <span className="text-[11px] text-muted-foreground">
                {form.comment.length} characters
              </span>
            </div>
            <Textarea
              id="comment"
              value={form.comment}
              onChange={(event) => setValue('comment', event.target.value)}
              placeholder="How are lectures delivered? Are doubts cleared easily? Any advice for upcoming semester students?"
              className="min-h-32 bg-card"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full gap-2 shadow-md shadow-primary/20"
            disabled={submitting}
          >
            {submitting ? (
              <>Submitting Review...</>
            ) : (
              <>
                <Send size={16} /> Submit Anonymous Review
              </>
            )}
          </Button>
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
