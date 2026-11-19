import React, { useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Building,
  Hash,
  Layers,
  Calendar,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import OtpVerificationModal from '../components/OtpVerificationModal'
import { validateKietEmail, KIET_ERROR_MSG, normalizeEmail } from '../utils/validators'

const initialState = {
  name: '',
  email: '',
  password: '',
  department: '',
  section: '',
  semester: '',
  registrationNumber: '',
}

export default function RegisterPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState(initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showOtpModal, setShowOtpModal] = useState(false)

  const setValue = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  // Live validation for email domain
  const isEmailDirty = form.email.length > 0
  const isKietDomainValid = !isEmailDirty || validateKietEmail(form.email)

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required.'
    if (!form.email.trim()) return 'College email is required.'
    if (!validateKietEmail(form.email)) {
      return KIET_ERROR_MSG
    }
    if (!form.password || form.password.length < 6) {
      return 'Password must be at least 6 characters in length.'
    }
    if (!form.department.trim()) return 'Department name is required (e.g. CSE, IT, ECE).'
    if (!form.section.trim()) return 'Section is required (e.g. A, B, C).'
    if (!String(form.semester).trim()) return 'Semester is required.'
    const sem = Number(form.semester)
    if (!Number.isFinite(sem) || sem < 1 || sem > 8) {
      return 'Semester number must be between 1 and 8.'
    }
    if (!form.registrationNumber.trim()) return 'University registration number is required.'

    return null
  }

  /**
   * Step 1: Validate inputs and request 6-digit OTP to the KIET email.
   */
  const handleInitiateRegistration = async (event) => {
    event.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      toast.error(validationError)
      return
    }

    setLoading(true)
    try {
      // Backend: POST /api/auth/send-otp
      const cleanEmail = normalizeEmail(form.email)
      const res = await axios.post('http://localhost:5000/api/auth/send-otp', {
        email: cleanEmail,
      })

      toast.success(res.data.message || 'Verification code sent to your KIET email address!')
      setShowOtpModal(true)
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Unable to send verification code. Please check your email address and try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Step 2: Handle successful OTP verification and finalize student account creation.
   */
  const handleOtpVerified = async ({ verificationToken }) => {
    setShowOtpModal(false)
    setLoading(true)
    try {
      const cleanEmail = normalizeEmail(form.email)
      await axios.post('http://localhost:5000/api/auth/register', {
        name: form.name.trim(),
        email: cleanEmail,
        password: form.password,
        role: 'student',
        department: form.department.trim(),
        section: form.section.trim(),
        semester: Number(form.semester),
        registrationNumber: form.registrationNumber.trim(),
        verificationToken,
      })

      toast.success('Account successfully registered and verified! Please log in.')
      navigate('/login', { replace: true })
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Failed to complete registration. Please try verifying again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center py-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-2xl mx-auto"
      >
        <Card className="border-border/80 bg-card/95 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <CardHeader className="text-center space-y-2 pb-6 border-b border-border/60">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 mb-1">
              <GraduationCap size={24} />
            </div>

            <div className="flex items-center justify-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/20">
                <Sparkles size={12} /> Institutional Student Portal
              </span>
            </div>

            <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Create Student Account
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Register with your KIET institutional credentials. An email verification code will be dispatched.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleInitiateRegistration} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Full Name */}
                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="name" className="flex items-center gap-1.5">
                    <User size={13} className="text-primary" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setValue('name', e.target.value)}
                    placeholder="e.g. Aryan Sharma"
                    className="bg-card"
                  />
                </div>

                {/* College Email */}
                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="email" className="flex items-center gap-1.5">
                    <Mail size={13} className="text-primary" />
                    College Email (@kiet.edu) *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setValue('email', e.target.value)}
                    placeholder="student@kiet.edu"
                    autoComplete="email"
                    className={`bg-card ${
                      isEmailDirty && !isKietDomainValid
                        ? 'border-destructive focus-visible:ring-destructive/20'
                        : ''
                    }`}
                  />
                  {isEmailDirty && !isKietDomainValid ? (
                    <p className="text-[11px] font-medium text-destructive flex items-center gap-1 pt-0.5">
                      <AlertCircle size={12} />
                      Only official @kiet.edu emails are allowed.
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      Must be an active KIET email ending in @kiet.edu
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="password" className="flex items-center gap-1.5">
                    <Lock size={13} className="text-primary" />
                    Password (6+ chars) *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setValue('password', e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="pr-10 bg-card"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="department" className="flex items-center gap-1.5">
                    <Building size={13} className="text-primary" />
                    Department / Branch *
                  </Label>
                  <Input
                    id="department"
                    value={form.department}
                    onChange={(e) => setValue('department', e.target.value)}
                    placeholder="e.g. IT, CSE, ECE, ME"
                    className="bg-card"
                  />
                </div>

                {/* Section */}
                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="section" className="flex items-center gap-1.5">
                    <Layers size={13} className="text-primary" />
                    Section *
                  </Label>
                  <Input
                    id="section"
                    value={form.section}
                    onChange={(e) => setValue('section', e.target.value)}
                    placeholder="e.g. A, B, or C"
                    className="bg-card"
                  />
                </div>

                {/* Semester */}
                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="semester" className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-primary" />
                    Current Semester (1 - 8) *
                  </Label>
                  <Input
                    id="semester"
                    type="number"
                    min={1}
                    max={8}
                    value={form.semester}
                    onChange={(e) => setValue('semester', e.target.value)}
                    placeholder="1 to 8"
                    className="bg-card"
                  />
                </div>

                {/* Registration Number */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="registrationNumber" className="flex items-center gap-1.5">
                    <Hash size={13} className="text-primary" />
                    University Registration / Roll No. *
                  </Label>
                  <Input
                    id="registrationNumber"
                    value={form.registrationNumber}
                    onChange={(e) => setValue('registrationNumber', e.target.value)}
                    placeholder="e.g. 2100290130000"
                    className="bg-card"
                  />
                </div>
              </div>

              {/* Error Alert Box */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Anonymity Notice */}
              <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground border border-border/50">
                <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                <span>
                  Your student identity will <strong>never</strong> be attached to the reviews you publish.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto"
                >
                  Already have an account? Sign in
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto shadow-md shadow-primary/20"
                  disabled={loading || (isEmailDirty && !isKietDomainValid)}
                >
                  {loading ? 'Sending OTP...' : 'Verify Email & Register'}
                  {!loading && <ArrowRight size={16} />}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <OtpVerificationModal
          email={form.email}
          isOpen={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          onChangeEmail={() => setShowOtpModal(false)}
          onVerified={handleOtpVerified}
          title="Verify KIET Email"
        />
      )}
    </div>
  )
}
