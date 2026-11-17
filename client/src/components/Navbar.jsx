import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sun,
  Moon,
  GraduationCap,
  Sparkles,
  Menu,
  X,
  Compass,
  BookOpen,
  HelpCircle,
  Layers,
  ArrowRight,
  LogOut,
  User,
} from 'lucide-react'

import { Button } from './ui/button'
import { clearToken, getRole, isLoggedIn } from '../utils/auth'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const authed = isLoggedIn()
  const role = getRole()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [prevPath, setPrevPath] = useState(location.pathname)

  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return false
  })

  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname)
    setMobileMenuOpen(false)
  }

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
    window.setTimeout(() => scrollToSection(id), 60)
  }

  const handleLogout = () => {
    clearToken()
    navigate('/', { replace: true })
  }

  const dashboardPath = role === 'admin' ? '/admin/dashboard' : '/student/dashboard'

  return (
    <>
      <motion.header
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md"
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          {/* Logo & Brand */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25 transition-transform duration-200 group-hover:scale-105">
              <GraduationCap size={22} />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  Rate My Proff
                </span>
                <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary border border-primary/20">
                  KIET
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">Academic Feedback Portal</p>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                  isActive && isHome
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              Home
            </NavLink>

            {authed && (
              <NavLink
                to={dashboardPath}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                Dashboard
              </NavLink>
            )}

            <button
              type="button"
              onClick={() => handleHomeSectionClick('features')}
              className="rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              Features
            </button>

            <button
              type="button"
              onClick={() => handleHomeSectionClick('how')}
              className="rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              How It Works
            </button>

            <button
              type="button"
              onClick={() => handleHomeSectionClick('leaderboard')}
              className="rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              Leaderboard
            </button>
          </nav>

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card/80 text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Toggle dark/light theme"
              title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDark ? (
                <Sun size={17} className="text-amber-400" />
              ) : (
                <Moon size={17} className="text-slate-700" />
              )}
            </button>

            {/* Desktop Auth Controls */}
            <div className="hidden sm:flex items-center gap-2">
              {!authed ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate('/register')}
                    className="shadow-sm"
                  >
                    Get Started <ArrowRight size={14} />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => navigate(dashboardPath)}
                  >
                    <User size={14} />
                    {role === 'admin' ? 'Admin Panel' : 'My Dashboard'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    title="Log out of account"
                  >
                    <LogOut size={14} />
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card text-foreground md:hidden cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sticky top-[60px] z-30 border-b border-border bg-card/95 backdrop-blur-xl px-4 py-4 md:hidden overflow-hidden shadow-xl"
          >
            <div className="flex flex-col gap-2">
              <NavLink
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted text-foreground"
              >
                <Compass size={16} className="text-primary" />
                Home
              </NavLink>

              {authed && (
                <NavLink
                  to={dashboardPath}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted text-foreground"
                >
                  <User size={16} className="text-primary" />
                  Dashboard
                </NavLink>
              )}

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleHomeSectionClick('features')
                }}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted text-foreground text-left cursor-pointer"
              >
                <Layers size={16} className="text-primary" />
                Features
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleHomeSectionClick('how')
                }}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted text-foreground text-left cursor-pointer"
              >
                <HelpCircle size={16} className="text-primary" />
                How It Works
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleHomeSectionClick('leaderboard')
                }}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted text-foreground text-left cursor-pointer"
              >
                <Sparkles size={16} className="text-primary" />
                Faculty Leaderboard
              </button>

              <div className="my-2 border-t border-border pt-3 flex flex-col gap-2">
                {!authed ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-center"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        navigate('/login')
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      className="w-full justify-center"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        navigate('/register')
                      }}
                    >
                      Get Started
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="default"
                      className="w-full justify-center"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        navigate(dashboardPath)
                      }}
                    >
                      Open Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-center text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        handleLogout()
                      }}
                    >
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
