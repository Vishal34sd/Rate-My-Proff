import { Link } from 'react-router-dom'

import { Button } from './ui/button'

function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-(--ui-border) bg-(--ui-surface)/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
        <Link to="/" className="group">
          <h1 className="text-3xl font-extrabold tracking-tight font-sans text-yellow-300">
            <span className="text-primary">Rate</span> <span className="text-foreground">My</span>{' '}
            <span className="text-primary">Proff.</span>
          </h1>
          <p className="text-xs text-(--ui-muted-text) transition-colors group-hover:text-(--ui-text)">
            Student-powered professor reviews
          </p>
        </Link>

        <nav className="flex items-center gap-2">
          <Link to="/">
            <Button variant="secondary">Home</Button>
          </Link>
          <Link to="/review">
            <Button variant="secondary">Review</Button>
          </Link>
          <Link to="/add-professor">
            <Button variant="secondary">Add Professor</Button>
          </Link>
          <Link to="/leaderboard">
            <Button>Leaderboard</Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
