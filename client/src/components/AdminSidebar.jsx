import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  UserPlus,
  TrendingUp,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  ShieldAlert,
  GraduationCap,
} from 'lucide-react'

import { clearToken, getUserFromToken } from '../utils/auth'
import LogoutModal from './LogoutModal'

const ADMIN_NAV_ITEMS = [
  {
    id: 'directory',
    label: 'Faculty Directory',
    icon: Users,
    badge: 'count',
    description: 'Manage & view faculty',
  },
  {
    id: 'add-faculty',
    label: 'Add Faculty',
    icon: UserPlus,
    badge: 'New',
    description: 'Register new professor',
  },
  {
    id: 'ratings',
    label: 'Weekly & Monthly Ratings',
    icon: TrendingUp,
    badge: 'Live',
    description: 'Performance trends',
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: LogOut,
    badge: null,
    description: 'Sign out securely',
    isAction: true,
  },
]

export default function AdminSidebar({
  activeSection = 'directory',
  onSelectSection,
  professorCount = 0,
}) {
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

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

  const handleConfirmLogout = () => {
    setShowLogoutModal(false)
    clearToken()
    navigate('/', { replace: true })
  }

  const handleItemClick = (item) => {
    if (item.id === 'logout') {
      setShowLogoutModal(true)
      return
    }

    if (onSelectSection) {
      onSelectSection(item.id)
    }
    setIsMobileOpen(false)
  }

  const tokenUser = getUserFromToken()
  const displayName = tokenUser?.name || 'Administrator'
  const displayEmail = tokenUser?.email || 'admin@kiet.edu'
  const initials = displayName.trim().slice(0, 1).toUpperCase() || 'A'

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/85 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/60 text-foreground transition-colors hover:bg-muted cursor-pointer"
            aria-label="Open sidebar drawer"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/25">
              <ShieldAlert size={18} />
            </div>
            <span className="font-bold text-foreground text-sm tracking-tight">Admin Console</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-700" />}
          </button>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-xs font-bold text-primary"
            title="Admin User"
          >
            {initials}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Backdrop Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container (Collapsible on Desktop, Drawer on Mobile) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-border bg-card text-card-foreground transition-[width] duration-300 ease-in-out lg:sticky lg:h-screen ${
          isCollapsed ? 'lg:w-20' : 'lg:w-68'
        } ${isMobileOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between border-b border-border/80 px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <motion.div
              whileHover={{ rotate: [0, -6, 6, 0], scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/25"
            >
              <ShieldAlert size={22} />
            </motion.div>
            {(!isCollapsed || isMobileOpen) && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-bold tracking-tight text-foreground truncate">Rate My Prof</h1>
                  <span className="rounded-full bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-bold text-orange-600 dark:text-orange-400 border border-orange-500/20">
                    Admin
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">KIET Portal Console</p>
              </motion.div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
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

        {/* Quick Add Faculty Button on Top (Expanded Mode) */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="px-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (onSelectSection) onSelectSection('add-faculty')
                setIsMobileOpen(false)
              }}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 py-2.5 text-xs font-semibold text-white shadow-md shadow-orange-500/20 transition-all hover:shadow-lg hover:shadow-orange-500/30 cursor-pointer"
            >
              <UserPlus size={16} className="transition-transform group-hover:scale-110 duration-200" />
              <span>Add New Faculty</span>
            </motion.button>
          </div>
        )}

        {/* Navigation Menu Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          <div className="px-2 pb-1.5">
            {(!isCollapsed || isMobileOpen) ? (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Admin Controls
              </span>
            ) : (
              <div className="h-px bg-border/60 mx-1" />
            )}
          </div>

          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = !item.isAction && activeSection === item.id

            let badgeDisplay = null
            if (item.badge === 'count' && professorCount > 0) {
              badgeDisplay = `${professorCount}`
            } else if (item.badge === 'New' || item.badge === 'Live') {
              badgeDisplay = item.badge
            }

            return (
              <motion.button
                key={item.id}
                onClick={() => handleItemClick(item)}
                whileHover={{ x: isCollapsed && !isMobileOpen ? 0 : 3 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  item.id === 'logout'
                    ? 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                    : isActive
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : 'gap-3'}`}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
              >
                {/* Active Indicator Background */}
                {isActive && (
                  <motion.div
                    layoutId="activeAdminSidebarIndicator"
                    className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/30"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}

                {/* Left Active Glow Notch */}
                {isActive && (
                  <motion.div
                    layoutId="activeAdminSidebarNotch"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-primary shadow-[0_0_8px_rgba(249,115,22,0.8)]"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}

                <div className="relative flex items-center justify-center">
                  <Icon
                    size={19}
                    className={`transition-colors duration-200 ${
                      item.id === 'logout'
                        ? 'text-muted-foreground group-hover:text-destructive'
                        : isActive
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  />
                </div>

                {(!isCollapsed || isMobileOpen) && (
                  <div className="relative flex flex-1 items-center justify-between overflow-hidden text-left">
                    <div className="truncate">
                      <p className="truncate leading-none">{item.label}</p>
                      <p className="mt-0.5 text-[11px] font-normal text-muted-foreground/80 truncate">
                        {item.description}
                      </p>
                    </div>

                    {badgeDisplay && (
                      <span
                        className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-transform group-hover:scale-105 ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : item.badge === 'Live'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-muted border border-border text-muted-foreground'
                        }`}
                      >
                        {badgeDisplay}
                      </span>
                    )}
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Sidebar Footer: Theme Toggle & Admin User Info */}
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
                {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} />}
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

          {/* Admin Profile Snippet with Logout Trigger */}
          <div
            className={`flex items-center rounded-xl border border-border/80 bg-card p-2 shadow-xs transition-colors ${
              isCollapsed && !isMobileOpen ? 'justify-center' : 'justify-between gap-2.5'
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-orange-500/50 bg-gradient-to-br from-orange-500/20 to-amber-500/30 text-xs font-bold text-orange-500 shadow-xs">
                {initials}
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="min-w-0 overflow-hidden text-left">
                  <p className="truncate text-xs font-semibold text-foreground">
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
                onClick={() => setShowLogoutModal(true)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive cursor-pointer"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  )
}
