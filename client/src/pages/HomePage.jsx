import React from 'react'
import { Link } from 'react-router-dom'

import ProfessorCard from '../components/ProfessorCard'
import SearchBar from '../components/SearchBar'
import SortDropdown from '../components/SortDropdown'
import { Button } from '../components/ui/button'
import { useAppData } from '../lib/app-context'
import { getProfessorStats } from '../lib/utils'

function normalizeSearchTerm(value) {
  return value.trim().toLowerCase()
}

function getAverageOverallRating(professor) {
  return getProfessorStats(professor).averageOverall
}

function matchesProfessorName(professor, searchTerm) {
  return professor.name.toLowerCase().includes(searchTerm)
}

function sortProfessors(list, sortBy) {
  const sorted = [...list]

  if (sortBy === 'most-reviewed') {
    sorted.sort((a, b) => b.reviews.length - a.reviews.length)
    return sorted
  }

  if (sortBy === 'name-asc') {
    sorted.sort((a, b) => a.name.localeCompare(b.name))
    return sorted
  }

  sorted.sort((a, b) => {
    const aRating = getAverageOverallRating(a)
    const bRating = getAverageOverallRating(b)
    return bRating - aRating
  })
  return sorted
}

function HomePage() {
  const { professors } = useAppData()
  const [search, setSearch] = React.useState('')
  const [sortBy, setSortBy] = React.useState('highest-rated')
  const normalizedSearch = normalizeSearchTerm(search)

  const filtered = professors.filter((professor) => matchesProfessorName(professor, normalizedSearch))
  const professorsToRender = sortProfessors(filtered, sortBy)

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-(--ui-border) bg-(--ui-surface) p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-(--ui-strong)">Find and review your professors</h2>
            <p className="mt-1 text-sm text-(--ui-muted-text)">
              Check ratings, contact details, and share your classroom experience.
            </p>
          </div>
          <div className="flex items-center gap-2">
            
            
            <Link to="/review">
              <Button>Review Professor</Button>
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <SearchBar value={search} onChange={setSearch} />
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>

        {professorsToRender.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {professorsToRender.map((professor) => (
              <div key={professor.id}>
                <ProfessorCard professor={professor} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-(--ui-border) bg-(--ui-surface) p-6 text-center text-(--ui-muted-text)">
            No reviews yet for this search.
          </div>
        )}
      </section>
    </div>
  )
}

export default HomePage
