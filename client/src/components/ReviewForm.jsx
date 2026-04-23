import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'

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
    if (!form.professorId) return 'Please select a professor.'
    if (!form.subject) return 'Please choose a subject.'
    if (!form.rating) return 'Please select a rating.'
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

      toast.success('Review submitted successfully!')
      setForm((prev) => ({ ...prev, rating: 0, comment: '' }))
      onSubmitted?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Add a Review</CardTitle>
          <CardDescription>
            Share your honest classroom experience. Reviews are anonymous.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="professorId" className="mb-2 block">
                Professor
              </Label>
              <Select
                id="professorId"
                value={form.professorId}
                onChange={(event) => {
                  setValue('professorId', event.target.value)
                  setValue('subject', '')
                }}
              >
                <option value="">Select a professor</option>
                {professors.map((professor) => (
                  <option key={professor._id} value={professor._id}>
                    {professor.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="subject" className="mb-2 block">
                Subject
              </Label>
              <Select
                id="subject"
                value={form.subject}
                onChange={(event) => setValue('subject', event.target.value)}
                disabled={!form.professorId}
              >
                <option value="">Select a subject</option>
                {availableSubjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </Select>
              {!form.professorId ? (
                <p className="mt-2 text-xs text-(--ui-muted-text)">Select a professor to see subjects.</p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="rating" className="mb-2 block">
                Rating
              </Label>
              <RatingStars value={form.rating} onChange={(value) => setValue('rating', value)} />
            </div>

            <div>
              <Label htmlFor="comment" className="mb-2 block">
                Comment (optional)
              </Label>
              <Textarea
                id="comment"
                value={form.comment}
                onChange={(event) => setValue('comment', event.target.value)}
                placeholder="Any useful details for future students?"
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Review'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function useStateWithDefaults(defaultProfessorId) {
  const [state, setState] = useState(() => ({
    ...initialForm,
    professorId: defaultProfessorId || '',
  }))

  useEffect(() => {
    if (defaultProfessorId) {
      setState((prev) => ({ ...prev, professorId: defaultProfessorId }))
    }
  }, [defaultProfessorId])

  return [state, setState]
}

export default ReviewForm
