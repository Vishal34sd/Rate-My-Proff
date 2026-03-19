import { motion } from 'framer-motion'

import ReviewForm from '../components/ReviewForm'
import { useAppData } from '../lib/app-context'

function ReviewPage() {
  const { professors, addReview } = useAppData()

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="mx-auto max-w-3xl">
        <ReviewForm professors={professors} onSubmit={addReview} />
      </div>
    </motion.div>
  )
}

export default ReviewPage
