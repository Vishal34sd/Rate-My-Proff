import { Link } from 'react-router-dom'

import { Button } from './ui/button'

function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-(--ui-border) bg-(--ui-surface)/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <Link to="/" className="group">
          <h1 className="text-2xl font-black tracking-tight text-(--ui-strong)">RateMyProf</h1>
          <p className="text-xs text-(--ui-muted-text) transition-colors group-hover:text-(--ui-text)">
            Student-powered professor reviews
          </p>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/add-professor">
            <Button variant="secondary" size="sm">Add Professor</Button>
          </Link>
          <Link to="/review">
            <Button size="sm">Review Professor</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Navbar
