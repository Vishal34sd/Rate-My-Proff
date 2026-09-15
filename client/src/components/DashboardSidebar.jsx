import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  MessageSquareQuote,
  BarChart3,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  PlusCircle,
} from 'lucide-react'

import { clearToken, getUserFromToken } from '../utils/auth'

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    badge: null,
    description: 'Overview & professors',
  },
  {
    id: 'review',
    label: 'Review',
    icon: MessageSquareQuote,
    badge: 'My Reviews',
    description: 'Ratings & feedback',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    badge: 'Live',
    description: 'Insights & charts',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: UserCheck,
    badge: null,
    description: 'Account settings',
  },
]

export default function DashboardSidebar({
  activeSection = 'dashboard',
  onSelectSection,
  reviewCount = 0,
  professorCount = 0,
  user = null,
}) {
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      if (saved) return saved === 'dark'
      return document.documentElement.classList.contains('dark')
    }
    return true
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

  const handleLogout = () => {
    clearToken()
    navigate('/', { replace: true })
  }

  const tokenUser = getUserFromToken()
  const displayName = user?.name || tokenUser?.name || 'Student'
  const displayEmail = user?.email || tokenUser?.email || 'student@kiet.edu'
  const initials = displayName.trim().slice(0, 1).toUpperCase() || 'S'

  const handleItemClick = (id) => {
    onSelectSection(id)
    setIsMobileOpen(false)
  }

  return (
    <>
      {/* Mobile Top Bar with Hamburger Trigger */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/85 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/60 text-foreground transition-colors hover:bg-muted cursor-pointer"
            aria-label="Open sidebar navigation"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-md shadow-primary/25">
              R
            </div>
            <span className="font-semibold text-foreground text-sm tracking-tight">RateMyProf</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={16} className="text-primary" /> : <Moon size={16} className="text-primary" />}
          </button>
          <div
            onClick={() => handleItemClick('profile')}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-sm font-bold text-primary"
          >
            {initials}
          </div>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-border bg-card text-card-foreground transition-[width] duration-300 ease-in-out lg:sticky lg:h-screen ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${isMobileOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between border-b border-border/80 px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <motion.div
              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-amber-500 font-black text-primary-foreground shadow-lg shadow-primary/25"
            >
              R
            </motion.div>
            {(!isCollapsed || isMobileOpen) && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-bold tracking-tight text-foreground">RateMyProf</h1>
                  <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    Student
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">Portal & Reviews</p>
              </motion.div>
            )}
          </div>

          {/* Desktop Collapse Toggle Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden h-7 w-7 items-center justify-center rounded-lg border border-border bg-muted/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex cursor-pointer"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Action (Add Review) when expanded */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="px-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/student/reviews/new')}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary via-amber-500 to-orange-500 py-2.5 text-xs font-semibold text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 cursor-pointer"
            >
              <PlusCircle size={16} className="transition-transform group-hover:rotate-90 duration-300" />
              <span>Write a Review</span>
              <Sparkles size={13} className="text-amber-200 animate-pulse" />
            </motion.button>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          <div className="px-2 pb-1.5">
            {(!isCollapsed || isMobileOpen) ? (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Navigation
              </span>
            ) : (
              <div className="h-px bg-border/60 mx-1" />
            )}
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            // Dynamic badges
            let badgeText = item.badge
            if (item.id === 'review' && reviewCount > 0) {
              badgeText = `${reviewCount}`
            } else if (item.id === 'dashboard' && professorCount > 0) {
              badgeText = `${professorCount}`
            }

            return (
              <motion.button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                whileHover={{ x: isCollapsed && !isMobileOpen ? 0 : 3 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : 'gap-3'}`}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
              >
                {/* Active Spring Animated Background Pill */}
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/30"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}

                {/* Left Active Glow Notch */}
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarNotch"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-primary shadow-[0_0_8px_rgba(246,130,31,0.8)]"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}

                <div className="relative flex items-center justify-center">
                  <Icon
                    size={19}
                    className={`transition-colors duration-200 ${
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  />
                </div>

                {(!isCollapsed || isMobileOpen) && (
                  <div className="relative flex flex-1 items-center justify-between overflow-hidden text-left">
                    <div className="truncate">
                      <p className="truncate leading-none">{item.label}</p>
                      <p className="mt-0.5 text-[11px] font-normal text-muted-foreground/80">
                        {item.description}
                      </p>
                    </div>

                    {badgeText && (
                      <span
                        className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-transform group-hover:scale-105 ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted border border-border text-muted-foreground'
                        }`}
                      >
                        {badgeText}
                      </span>
                    )}
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-border/80 p-3 space-y-2">
          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`group flex w-full items-center rounded-xl border border-border/80 bg-muted/40 p-2 text-xs font-medium text-foreground transition-all hover:bg-muted cursor-pointer ${
              isCollapsed && !isMobileOpen ? 'justify-center' : 'justify-between'
            }`}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-card border border-border/60 text-primary">
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <span className="text-muted-foreground group-hover:text-foreground">
                  {isDark ? 'Light Theme' : 'Dark Theme'}
                </span>
              )}
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <span className="rounded px-1.5 py-0.5 text-[10px] uppercase font-semibold text-muted-foreground">
                {isDark ? 'Dark' : 'Light'}
              </span>
            )}
          </button>

          {/* User Profile Snippet & Logout */}
          <div
            className={`flex items-center rounded-xl border border-border/80 bg-card p-2 shadow-xs transition-colors ${
              isCollapsed && !isMobileOpen ? 'justify-center' : 'justify-between gap-2.5'
            }`}
          >
            <div
              onClick={() => handleItemClick('profile')}
              className="flex items-center gap-2.5 overflow-hidden cursor-pointer group"
              title="View Profile"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/50 bg-gradient-to-br from-primary/20 to-primary/40 text-xs font-bold text-primary shadow-xs">
                {initials}
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="min-w-0 overflow-hidden text-left">
                  <p className="truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    {displayName}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {displayEmail}
                  </p>
                </div>
              )}
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive cursor-pointer"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
