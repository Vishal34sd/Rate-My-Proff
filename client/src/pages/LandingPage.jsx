import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-10">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="grid items-center gap-8 md:grid-cols-2"
      >
        <div className="space-y-5">
          <p className="inline-flex w-fit items-center rounded-full border border-(--ui-border) bg-(--ui-surface) px-3 py-1 text-xs text-(--ui-muted-text)">
            Anonymous reviews • Role-based access • Fast search
          </p>

          <h1 className="text-balance text-4xl font-semibold tracking-tight text-(--ui-strong) md:text-5xl">
            Make better class choices with trusted professor reviews.
          </h1>

          <p className="max-w-xl text-pretty text-(--ui-muted-text)">
            Rate My Professor helps students share honest classroom feedback and helps admins maintain an up-to-date professor directory.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/register')}>
              Get Started
            </Button>
          </div>

          <p className="text-xs text-(--ui-muted-text)">
            Tip: Use your <span className="text-(--ui-text)">@kiet.edu</span> email to register.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: 0.05 }}
          className="grid gap-4"
        >
          <Card className="border-sky-500/25">
            <CardHeader>
              <CardTitle>Built for students</CardTitle>
              <CardDescription>Quickly find professors and leave anonymous reviews.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-(--ui-muted-text)">
                <li>• Search by professor name</li>
                <li>• Rate and comment per subject</li>
                <li>• Eligibility checks per department/section</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Built for admins</CardTitle>
              <CardDescription>Manage professor directory cleanly and safely.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-(--ui-muted-text)">
                <li>• Add / update / remove professors</li>
                <li>• Review insights per professor</li>
                <li>• Secure routes with JWT</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.15 }}
        className="rounded-3xl border border-(--ui-border) bg-(--ui-surface) p-6"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold text-(--ui-strong)">Ready to get started?</p>
            <p className="text-sm text-(--ui-muted-text)">Login if you already have an account, or create one in under a minute.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/register')}>Create account</Button>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
