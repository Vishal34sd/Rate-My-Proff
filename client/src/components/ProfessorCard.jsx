import { Link } from 'react-router-dom'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

function ProfessorCard({ professor }) {
  return (
    <div className="transition-transform duration-200 hover:-translate-y-1">
      <Link to={`/professor/${professor._id}`}>
        <Card className="h-full overflow-hidden border-(--ui-border) hover:border-sky-500/70">
          <CardHeader>
            <CardTitle>{professor.name}</CardTitle>
            <p className="text-sm text-(--ui-muted-text)">{professor.department}</p>
            <CardDescription>Click to view details and reviews.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-(--ui-muted-text)">
              <p>
                <span className="text-(--ui-text)">Subjects:</span>{' '}
                {(professor.subjects || []).join(', ') || '—'}
              </p>
              <p>
                <span className="text-(--ui-text)">Sections:</span>{' '}
                {(professor.sections || []).join(', ') || '—'}
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}

export default ProfessorCard
