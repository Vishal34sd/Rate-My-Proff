import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Mail,
  ShieldCheck,
  RotateCw,
  ArrowRight,
  AlertCircle,
  X,
  Edit2,
  Clock,
  Sparkles,
} from 'lucide-react'

import { Button } from './ui/button'
import OtpInput from './OtpInput'

export default function OtpVerificationModal({
  email,
  isOpen = true,
  onClose,
  onVerified,
  onChangeEmail,
  title = 'Verify Your KIET Email',
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [cooldown, setCooldown] = useState(60)
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')

  // 60-second countdown timer for Resend OTP
  useEffect(() => {
    let interval = null
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [cooldown])

  const fullOtp = otp.join('')

  const handleVerify = async (e) => {
    if (e) e.preventDefault()
    setError('')

    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of your verification code.')
      return
    }

    setVerifying(true)
    try {
      // Backend: POST /api/auth/verify-otp
      const response = await axios.post('http://localhost:8080/api/auth/verify-otp', {
        email: email.trim().toLowerCase(),
        otp: fullOtp,
      })

      const data = response.data
      toast.success('KIET institutional email verified successfully!')

      if (onVerified) {
        onVerified({
          email: data.email || email,
          verificationToken: data.verificationToken,
          hasAccount: data.hasAccount,
        })
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Failed to verify code. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0 || resending) return
    setError('')
    setResending(true)

    try {
      // Backend: POST /api/auth/resend-otp
      await axios.post('http://localhost:8080/api/auth/resend-otp', {
        email: email.trim().toLowerCase(),
      })

      toast.success('A new 6-digit verification code has been dispatched to your email.')
      setOtp(['', '', '', '', '', ''])
      setCooldown(60)
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Unable to resend verification code. Please wait.'
      setError(msg)
      toast.error(msg)
      if (err?.response?.data?.retryAfterSeconds) {
        setCooldown(err.response.data.retryAfterSeconds)
      }
    } finally {
      setResending(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl space-y-6"
        >
          {/* Close button if onClose is provided */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          )}

          {/* Modal Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 mb-2">
              <ShieldCheck size={28} />
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary border border-primary/20">
              <Sparkles size={12} /> KIET Institutional Verification
            </span>

            <h3 className="text-2xl font-black tracking-tight text-foreground">
              {title}
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              We've sent a 6-digit verification code to your college email:
            </p>

            {/* Recipient Email Chip */}
            <div className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-muted/40 px-3.5 py-1.5 mt-1">
              <Mail size={14} className="text-primary" />
              <span className="text-xs font-bold text-foreground truncate max-w-[240px]">
                {email}
              </span>
              {onChangeEmail && (
                <button
                  type="button"
                  onClick={onChangeEmail}
                  className="text-primary hover:underline flex items-center gap-0.5 text-[11px] font-semibold cursor-pointer ml-1"
                  title="Change Email Address"
                >
                  <Edit2 size={12} />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          {/* 6-Digit OTP Input */}
          <div className="space-y-3">
            <OtpInput value={otp} onChange={setOtp} disabled={verifying} />

            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-amber-500" />
                <span>Code valid for 5 minutes</span>
              </span>

              <span>Single-use OTP</span>
            </div>
          </div>

          {/* Error Notice */}
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

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Button
              type="button"
              onClick={handleVerify}
              size="lg"
              className="w-full gap-2 shadow-md shadow-primary/20"
              disabled={verifying || fullOtp.length !== 6}
            >
              {verifying ? (
                <>Verifying Code...</>
              ) : (
                <>
                  Verify Code <ArrowRight size={16} />
                </>
              )}
            </Button>

            {/* Resend Cooldown Counter / Trigger */}
            <div className="flex items-center justify-center pt-1 text-xs">
              {cooldown > 0 ? (
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <RotateCw size={13} className="animate-spin text-primary" />
                  Resend code in <strong className="text-primary">{cooldown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="font-bold text-primary hover:underline transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCw size={14} />
                  {resending ? 'Sending...' : 'Resend Verification Code'}
                </button>
              )}
            </div>

            {/* Secondary Option: Change Email or Go Back */}
            {onChangeEmail && (
              <div className="text-center pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={onChangeEmail}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
                >
                  ← Wrong email address? Change Email
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
