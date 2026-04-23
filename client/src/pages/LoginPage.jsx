import React, { useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter email and password.')
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
        setError('Login succeeded but no token was returned.')
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

      // Fallback: if a protected page sent them here
      if (from) {
        navigate(from, { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="mx-auto w-full max-w-lg"
    >
      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Login with your KIET account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@kiet.edu"
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="password" className="mb-2 block">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </Button>

            <p className="text-center text-sm text-(--ui-muted-text)">
              No account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-sky-300 hover:text-sky-200"
              >
                Create one
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
