import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'

import { Button } from './ui/button'
import { clearToken, getRole, isLoggedIn } from '../utils/auth'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'rounded-xl px-3 py-2 text-sm transition-colors',
          isActive
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const authed = isLoggedIn()
  const role = getRole()

  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return false
  })

  const toggleTheme = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    if (nextDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const isHome = location.pathname === '/'

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleHomeSectionClick = (id) => {
    if (isHome) {
      scrollToSection(id)
      return
    }

    navigate('/', { replace: false })
    // Let the route render before trying to find the element.
    window.setTimeout(() => scrollToSection(id), 50)
  }

  const handleLogout = () => {
    clearToken()
    navigate('/', { replace: true })
  }

  const dashboardPath = role === 'admin' ? '/admin/dashboard' : '/student/dashboard'

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-primary/20 ring-1 ring-primary/40 flex items-center justify-center font-bold text-primary">
            R
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">Rate My Professor</p>
            <p className="text-xs text-muted-foreground">KIET feedback portal</p>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex">
          {isHome ? (
            <>
              <button
                type="button"
                onClick={() => handleHomeSectionClick('about')}
                className="rounded-xl px-3 py-2 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                About
              </button>
              <button
                type="button"
                onClick={() => handleHomeSectionClick('how')}
                className="rounded-xl px-3 py-2 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                How it works
              </button>
              <button
                type="button"
                onClick={() => handleHomeSectionClick('features')}
                className="rounded-xl px-3 py-2 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                Features
              </button>
            </>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Toggle dark/light theme"
            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
          >
            {isDark ? <Sun size={17} className="text-primary" /> : <Moon size={17} className="text-primary" />}
          </button>

          {!authed ? (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button variant="default" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate(dashboardPath)}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}

export default Navbar
