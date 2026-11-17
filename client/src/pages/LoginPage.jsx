import React, { useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

import { setToken, getRole } from '../utils/auth'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please provide both your KIET email address and password.')
      return
    }

    setLoading(true)
    try {
      // Backend: POST /api/auth/login
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email: email.trim(),
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
      setError(
        err?.response?.data?.message ||
          'Unable to sign in. Please verify your credentials and try again.',
      )
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
        className="w-full max-w-md mx-auto"
      >
        <Card className="border-border/80 bg-card/95 shadow-2xl backdrop-blur-md">
          {/* Top Brand Pill Header */}
          <CardHeader className="text-center space-y-2 pb-6 border-b border-border/60">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 mb-1">
              <GraduationCap size={24} />
            </div>
            <CardTitle className="text-2xl font-black tracking-tight text-foreground">
              Welcome back
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Sign in to rate professors, browse peer reviews, and view academic insights.
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
                    className="bg-card"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Use your official institutional email (e.g. @kiet.edu)
                </p>
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
                  className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit CTA */}
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2 shadow-md shadow-primary/20"
                disabled={loading}
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
    </div>
  )
}
