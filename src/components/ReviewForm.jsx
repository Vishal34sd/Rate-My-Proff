import React from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import RatingStars from './RatingStars'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Textarea } from './ui/textarea'

const initialForm = {
  selectedProfessor: '',
  teaching: 0,
  leniency: 0,
  attendance: 0,
  examChecking: 0,
  comment: '',
}

function ReviewField({ id, label, value, onChange }) {
  return (
    <div>
      <Label htmlFor={id} className="mb-2 block">
        {label}
      </Label>
      <RatingStars value={value} onChange={onChange} />
    </div>
  )
}

function ReviewForm({ onSubmit, professors = [] }) {
  const [form, setForm] = React.useState(initialForm)
  const [errors, setErrors] = React.useState({})

  const setValue = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = {}

    if (!form.selectedProfessor) {
      nextErrors.selectedProfessor = 'Please select a professor.'
    }

    const hasAnyRating = [form.teaching, form.leniency, form.attendance, form.examChecking].some(
      (value) => value > 0,
    )

    if (!hasAnyRating) {
      nextErrors.rating = 'Select at least one rating.'
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    const selected = professors.find((item) => item.id === form.selectedProfessor)

    if (!selected) {
      setErrors({ selectedProfessor: 'Please select a valid professor.' })
      return
    }

    onSubmit({
      professorName: selected.name,
      teaching: form.teaching,
      leniency: form.leniency,
      attendance: form.attendance,
      examChecking: form.examChecking,
      comment: form.comment.trim(),
    })

    toast.success('Review submitted successfully!')
    setForm(initialForm)
    setErrors({})
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card>
        <CardHeader>
          <CardTitle>Add a Review</CardTitle>
          <CardDescription>Share your honest classroom experience.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="selectedProfessor" className="mb-2 block">
                Professor
              </Label>
              <Select
                id="selectedProfessor"
                value={form.selectedProfessor}
                onChange={(event) => setValue('selectedProfessor', event.target.value)}
              >
                <option value="">Select a professor</option>
                {professors.map((professor) => (
                  <option key={professor.id} value={professor.id}>
                    {professor.name}
                  </option>
                ))}
              </Select>
              {errors.selectedProfessor ? <p className="mt-2 text-sm text-red-500">{errors.selectedProfessor}</p> : null}
            </div>

            <ReviewField id="teaching" label="Teaching" value={form.teaching} onChange={(value) => setValue('teaching', value)} />
            <ReviewField id="leniency" label="Leniency" value={form.leniency} onChange={(value) => setValue('leniency', value)} />
            <ReviewField id="attendance" label="Attendance" value={form.attendance} onChange={(value) => setValue('attendance', value)} />
            <ReviewField
              id="examChecking"
              label="Exam Checking"
              value={form.examChecking}
              onChange={(value) => setValue('examChecking', value)}
            />

            {errors.rating ? <p className="text-sm text-red-500">{errors.rating}</p> : null}

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

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button type="submit" className="w-full">
                Submit Review
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ReviewForm
