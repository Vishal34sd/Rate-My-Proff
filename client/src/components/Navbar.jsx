import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

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
            ? 'bg-(--ui-muted) text-(--ui-strong)'
            : 'text-(--ui-muted-text) hover:bg-(--ui-muted) hover:text-(--ui-text)',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

function Navbar() {
  const navigate = useNavigate()
  const authed = isLoggedIn()
  const role = getRole()

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
      className="sticky top-0 z-40 border-b border-(--ui-border) bg-[rgba(11,17,32,0.75)] backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-sky-600/20 ring-1 ring-sky-500/30" />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-(--ui-strong)">Rate My Professor</p>
            <p className="text-xs text-(--ui-muted-text)">KIET feedback portal</p>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex">
          <NavItem to="/">Home</NavItem>
          {authed ? <NavItem to={dashboardPath}>Dashboard</NavItem> : null}
        </nav>

        <div className="flex items-center gap-2">
          {!authed ? (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button variant="secondary" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => navigate(dashboardPath)}>
                {role === 'admin' ? 'Admin' : 'Student'}
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
