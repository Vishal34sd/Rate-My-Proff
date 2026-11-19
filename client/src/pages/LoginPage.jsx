import React, { useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Sparkles,
  ArrowRight,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react'

import { setToken, getRole } from '../utils/auth'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import OtpVerificationModal from '../components/OtpVerificationModal'
import { validateKietEmail, KIET_ERROR_MSG, normalizeEmail } from '../utils/validators'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const [showOtpModal, setShowOtpModal] = useState(false)

  const from = location.state?.from

  const isEmailDirty = email.length > 0
  const isKietDomainValid = !isEmailDirty || validateKietEmail(email)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setUnverifiedEmail('')

    if (!email.trim() || !password) {
      setError('Please provide both your KIET email address and password.')
      return
    }

    if (!validateKietEmail(email)) {
      setError(KIET_ERROR_MSG)
      return
    }

    setLoading(true)
    try {
      // Backend: POST /api/auth/login
      const cleanEmail = normalizeEmail(email)
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email: cleanEmail,
        password,
      })

      const token = response?.data?.token
      if (!token) {
        setError('Login succeeded but no session token was returned.')
        return
      }

      setToken(token)

      // Role-based redirect
      const role = getRole()
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true })
        return
      }

      if (role === 'student') {
        navigate('/student/dashboard', { replace: true })
        return
      }

      // Fallback
      if (from) {
        navigate(from, { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      const respData = err?.response?.data
      if (respData?.emailVerified === false) {
        setUnverifiedEmail(respData.email || normalizeEmail(email))
        setError(respData.message || 'Please verify your KIET institutional email address.')
      } else {
        setError(
          respData?.message ||
            'Unable to sign in. Please verify your credentials and try again.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStartVerification = async () => {
    try {
      const targetEmail = unverifiedEmail || normalizeEmail(email)
      await axios.post('http://localhost:8080/api/auth/send-otp', {
        email: targetEmail,
      })
      toast.success('A new 6-digit verification code has been dispatched to your email.')
      setShowOtpModal(true)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to dispatch verification code.')
    }
  }

  const handleVerifiedSuccess = () => {
    setShowOtpModal(false)
    setUnverifiedEmail('')
    setError('')
    toast.success('Email verified successfully! Please log in with your password.')
  }

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center py-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="border-border/80 bg-card/95 shadow-2xl backdrop-blur-md">
          {/* Top Brand Pill Header */}
          <CardHeader className="text-center space-y-2 pb-6 border-b border-border/60">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 mb-1">
              <GraduationCap size={24} />
            </div>

            <div className="flex items-center justify-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/20">
                <Sparkles size={12} /> KIET Academic Feedback
              </span>
            </div>

            <CardTitle className="text-2xl font-black tracking-tight text-foreground">
              Welcome back
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Sign in with your verified KIET institutional email address.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail size={13} className="text-primary" />
                  College Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@kiet.edu"
                    autoComplete="email"
                    className={`bg-card ${
                      isEmailDirty && !isKietDomainValid
                        ? 'border-destructive focus-visible:ring-destructive/20'
                        : ''
                    }`}
                  />
                </div>
                {isEmailDirty && !isKietDomainValid ? (
                  <p className="text-[11px] font-medium text-destructive flex items-center gap-1">
                    <AlertCircle size={12} />
                    Only official @kiet.edu emails are allowed.
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    Must be your @kiet.edu institutional email address.
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="flex items-center gap-1.5">
                    <Lock size={13} className="text-primary" />
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
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

              {/* Error Alert Box */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive font-medium space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>

                  {unverifiedEmail && (
                    <Button
                      type="button"
                      variant="subtle"
                      size="sm"
                      onClick={handleStartVerification}
                      className="w-full mt-1.5 gap-1.5 text-xs justify-center"
                    >
                      <ShieldAlert size={14} /> Verify Email with OTP Now
                    </Button>
                  )}
                </motion.div>
              )}

              {/* Submit CTA */}
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2 shadow-md shadow-primary/20"
                disabled={loading || (isEmailDirty && !isKietDomainValid)}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                {!loading && <ArrowRight size={16} />}
              </Button>

              {/* Registration Link Footer */}
              <div className="pt-2 text-center text-xs text-muted-foreground">
                Don't have a student account?{' '}
                <Link
                  to="/register"
                  className="font-bold text-primary hover:underline transition-colors"
                >
                  Create one now
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* OTP Verification Modal for unverified logins */}
      {showOtpModal && (
        <OtpVerificationModal
          email={unverifiedEmail || normalizeEmail(email)}
          isOpen={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          onVerified={handleVerifiedSuccess}
          title="Verify Institutional Email"
        />
      )}
    </div>
  )
}
