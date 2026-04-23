import React, { useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'

const initialState = {
  name: '',
  email: '',
  password: '',
  role: 'student',
  department: '',
  section: '',
  semester: '',
  registrationNumber: '',
}

export default function RegisterPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const setValue = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const validate = () => {
    if (!form.name.trim()) return 'Name is required.'
    if (!form.email.trim()) return 'Email is required.'
    if (!form.email.trim().toLowerCase().endsWith('@kiet.edu')) return 'Only @kiet.edu emails are allowed.'
    if (!form.password || form.password.length < 6) return 'Password must be at least 6 characters.'
    if (!form.department.trim()) return 'Department is required.'
    if (!['student', 'admin'].includes(form.role)) return 'Role must be student or admin.'

    if (form.role === 'student') {
      if (!form.section.trim()) return 'Section is required for students.'
      if (!String(form.semester).trim()) return 'Semester is required for students.'
      const sem = Number(form.semester)
      if (!Number.isFinite(sem) || sem < 1 || sem > 8) return 'Semester must be between 1 and 8.'
      if (!form.registrationNumber.trim()) return 'Registration number is required for students.'
    }

    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      // Backend: POST /api/auth/register
      await axios.post('http://localhost:8080/api/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        department: form.department.trim(),
        section: form.role === 'student' ? form.section.trim() : undefined,
        semester: form.role === 'student' ? Number(form.semester) : undefined,
        registrationNumber: form.role === 'student' ? form.registrationNumber.trim() : undefined,
      })

      toast.success('Account created. Please login!')
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to register. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="mx-auto w-full max-w-2xl"
    >
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Register as a student or admin.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-1">
              <Label htmlFor="name" className="mb-2 block">
                Name
              </Label>
              <Input id="name" value={form.name} onChange={(e) => setValue('name', e.target.value)} />
            </div>

            <div className="md:col-span-1">
              <Label htmlFor="role" className="mb-2 block">
                Role
              </Label>
              <Select
                id="role"
                value={form.role}
                onChange={(e) => setValue('role', e.target.value)}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </Select>
            </div>

            <div className="md:col-span-1">
              <Label htmlFor="email" className="mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setValue('email', e.target.value)}
                placeholder="you@kiet.edu"
                autoComplete="email"
              />
            </div>

            <div className="md:col-span-1">
              <Label htmlFor="password" className="mb-2 block">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setValue('password', e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="department" className="mb-2 block">
                Department
              </Label>
              <Input
                id="department"
                value={form.department}
                onChange={(e) => setValue('department', e.target.value)}
                placeholder="CSE / IT / ..."
              />
            </div>

            {form.role === 'student' ? (
              <>
                <div>
                  <Label htmlFor="section" className="mb-2 block">
                    Section
                  </Label>
                  <Input
                    id="section"
                    value={form.section}
                    onChange={(e) => setValue('section', e.target.value)}
                    placeholder="A / B / C"
                  />
                </div>

                <div>
                  <Label htmlFor="semester" className="mb-2 block">
                    Semester
                  </Label>
                  <Input
                    id="semester"
                    type="number"
                    min={1}
                    max={8}
                    value={form.semester}
                    onChange={(e) => setValue('semester', e.target.value)}
                    placeholder="1-8"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="registrationNumber" className="mb-2 block">
                    Registration Number
                  </Label>
                  <Input
                    id="registrationNumber"
                    value={form.registrationNumber}
                    onChange={(e) => setValue('registrationNumber', e.target.value)}
                    placeholder="e.g. 2100290100..."
                  />
                </div>
              </>
            ) : null}

            {error ? (
              <div className="md:col-span-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <div className="md:col-span-2 flex items-center justify-between gap-3">
              <Button type="button" variant="ghost" onClick={() => navigate('/login')}>
                Back to login
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating…' : 'Create account'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
