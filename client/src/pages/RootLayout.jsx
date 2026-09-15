import { Outlet, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'

import Navbar from '../components/Navbar'

export default function RootLayout() {
  const location = useLocation()
  const showNavbar = location.pathname === '/'

  const isDashboardRoute =
    location.pathname.startsWith('/student') || location.pathname.startsWith('/admin')

  return (
    <div className="relative min-h-screen">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(243,128,32,0.12),transparent_55%)]" />
      {showNavbar ? <Navbar /> : null}

      <main className={isDashboardRoute ? "w-full min-h-screen" : "mx-auto w-full max-w-6xl px-4 py-10"}>
        <Outlet />
      </main>

      <Toaster richColors theme="dark" position="top-right" />
    </div>
  )
}
