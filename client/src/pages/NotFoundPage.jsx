import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Home, ArrowLeft } from 'lucide-react'

import { Button } from '../components/ui/button'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mx-auto max-w-lg rounded-3xl border border-border/80 bg-card/90 p-8 sm:p-12 text-center shadow-2xl backdrop-blur-md space-y-5"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner">
          <GraduationCap size={32} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Error 404
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Page Not Found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The academic portal page you are looking for doesn't exist or may have been relocated.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto gap-2"
          >
            <ArrowLeft size={16} /> Go Back
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto gap-2 shadow-md shadow-primary/20"
          >
            <Home size={16} /> Return Home
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
