import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import RatingStars from './RatingStars'
import { formatScore, getProfessorStats } from '../lib/utils'

function ProfessorCard({ professor }) {
  const stats = getProfessorStats(professor)

  return (
    <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
      <Link to={`/professor/${professor.id}`}>
        <Card className="h-full overflow-hidden border-(--ui-border) hover:border-sky-500/70">
          <div className="mb-4 h-44 overflow-hidden rounded-xl">
            <img
              src={professor.image}
              alt={professor.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <CardHeader>
            <CardTitle>{professor.name}</CardTitle>
            <p className="text-sm text-(--ui-muted-text)">{professor.post}</p>
            <CardDescription>
              {stats.totalReviews ? `${stats.totalReviews} review${stats.totalReviews > 1 ? 's' : ''}` : 'No reviews yet'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3 space-y-1 text-sm text-(--ui-muted-text)">
              <p>Experience: {professor.experience}</p>
              <p>Qualification: {professor.qualification}</p>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-(--ui-muted-text)">Average rating</p>
              <p className="text-lg font-semibold text-sky-600 dark:text-sky-300">{formatScore(stats.averageOverall)}</p>
            </div>
            <RatingStars value={Math.round(stats.averageOverall)} readOnly size={16} />
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

export default ProfessorCard
