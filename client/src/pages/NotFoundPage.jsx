import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

import { Button } from '../components/ui/button'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mx-auto max-w-xl rounded-3xl border border-(--ui-border) bg-(--ui-surface) p-10 text-center"
    >
      <p className="text-sm text-(--ui-muted-text)">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-(--ui-strong)">Page not found</h1>
      <p className="mt-3 text-sm text-(--ui-muted-text)">
        The page you’re looking for doesn’t exist or was moved.
      </p>

      <div className="mt-6 flex justify-center gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go back
        </Button>
        <Button onClick={() => navigate('/')}>Home</Button>
      </div>
    </motion.div>
  )
}
