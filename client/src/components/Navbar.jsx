import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sun,
  Moon,
  GraduationCap,
  ArrowRight,
  LogOut,
  User,
} from 'lucide-react'

import { Button } from './ui/button'
import { clearToken, getRole, isLoggedIn } from '../utils/auth'
import LogoutModal from './LogoutModal'

function Navbar() {
  const navigate = useNavigate()
  const authed = isLoggedIn()
  const role = getRole()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

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

  const handleConfirmLogout = () => {
    clearToken()
    setShowLogoutModal(false)
    navigate('/', { replace: true })
  }

  const dashboardPath = role === 'admin' ? '/admin/dashboard' : '/student/dashboard'

  return (
    <>
      <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
        {/* 1. Website Logo & Website Name: Rate My Professor */}
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25 transition-transform duration-200 group-hover:scale-105">
            <GraduationCap size={22} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
              Rate My Professor
            </span>
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
              KIET
            </span>
          </div>
        </NavLink>

        {/* 2. Clean Minimal Right Controls: Theme Toggle, Sign In, Register */}
        <div className="flex items-center gap-2 sm:gap-3">
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

          {!authed ? (
            <>
              {/* Sign In Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="font-medium px-3.5"
              >
                Sign In
              </Button>

              {/* Register Button */}
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/register')}
                className="font-semibold shadow-sm shadow-orange-500/20 px-4 gap-1.5"
              >
                <span>Register</span>
                <ArrowRight size={14} className="hidden sm:inline" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="subtle"
                size="sm"
                onClick={() => navigate(dashboardPath)}
                className="font-medium gap-1.5"
              >
                <User size={14} />
                <span>{role === 'admin' ? 'Admin Panel' : 'Dashboard'}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLogoutModal(true)}
                title="Log out of account"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                <LogOut size={15} />
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.header>

    {/* Logout Confirmation Dialog */}
    <LogoutModal
      isOpen={showLogoutModal}
      onClose={() => setShowLogoutModal(false)}
      onConfirm={handleConfirmLogout}
    />
  </>
  )
}

export default Navbar
