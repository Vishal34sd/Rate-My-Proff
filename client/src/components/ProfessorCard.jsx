import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Card, CardContent } from './ui/card'

function ProfessorCard({ professor, actions = null, clickable = true }) {
  const dept = professor?.department || '—'
  const section = professor?.sections || []
  const subjects = professor?.subjects || []

  const [imageFailed, setImageFailed] = useState(false)

  const imageUrl = (professor?.imageUrl || '').trim()
  const initials = (professor?.name || 'P').trim().slice(0, 1).toUpperCase()

  const apiBase = 'http://localhost:8080'

  const resolvedImageUrl =
    imageUrl && !imageFailed
      ? imageUrl.startsWith('http')
        ? imageUrl
        : `${apiBase}${imageUrl}`
      : ''

  const content = (
    <Card className="h-full overflow-hidden border-(--ui-border) hover:border-sky-500/70 transition-all duration-300 group hover:shadow-lg">
      <CardContent className="p-6">

        <div className="flex items-center justify-between gap-4">

          {/* 🔷 LEFT CONTENT */}
          <div className="flex-1 min-w-0 space-y-2">

            <h3 className="text-lg font-semibold truncate">
              {professor?.name || '—'}
            </h3>

            {professor?.post && (
              <p className="text-sm text-(--ui-muted-text)">
                {professor.post}
              </p>
            )}

            <p className="text-sm text-(--ui-muted-text)">
              {dept}
            </p>

            <div className="space-y-1 text-sm text-(--ui-muted-text) pt-2">
              <p>
                <span className="text-(--ui-text)">Subjects:</span>{' '}
                {subjects.length ? subjects.join(', ') : '—'}
              </p>

              <p>
                <span className="text-(--ui-text)">Section:</span>{' '}
                {section.length ? section.join(', ') : '—'}
              </p>

              <p>
                <span className="text-(--ui-text)">Experience:</span>{' '}
                {professor?.experienceYears === null || professor?.experienceYears === undefined
                  ? '—'
                  : `${professor.experienceYears} year${Number(professor.experienceYears) === 1 ? '' : 's'}`}
              </p>
            </div>
          </div>

          {/* 🔷 RIGHT IMAGE */}
          <div className="shrink-0">
            <div className="h-32 w-32 md:h-36 md:w-36 lg:h-44 lg:w-44 rounded-2xl overflow-hidden border border-(--ui-border) bg-(--ui-muted)">
              {resolvedImageUrl ? (
                <img
                  src={resolvedImageUrl}
                  alt={professor?.name || 'Professor'}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-(--ui-text)">
                  {initials}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* 🔷 EXTRA DETAILS */}
        <div className="mt-4 space-y-1 text-sm text-(--ui-muted-text)">
          <p>
            <span className="text-(--ui-text)">Qualification:</span>{' '}
            {professor?.qualification || '—'}
          </p>

          <p>
            <span className="text-(--ui-text)">Email:</span>{' '}
            {professor?.officialEmail || '—'}
          </p>

          <p>
            <span className="text-(--ui-text)">Contact:</span>{' '}
            {professor?.contactNumber || '—'}
          </p>
        </div>

        {/* 🔷 ACTIONS */}
        {actions && (
          <div className="mt-4 flex flex-wrap gap-2">
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="transition-transform duration-200 hover:-translate-y-1">
      {clickable && !actions ? (
        <Link to={`/professor/${professor._id}`}>
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  )
}

export default ProfessorCard