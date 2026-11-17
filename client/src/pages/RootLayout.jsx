import { Outlet, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'

import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function RootLayout() {
  const location = useLocation()
  
  // Dashboard routes with integrated full-screen sidebar
  const isDashboardOnly = location.pathname === '/student/dashboard'

  // Show footer on home and informational pages
  const showFooter =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register'

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Dynamic ambient radial backdrop glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(249,115,22,0.12),transparent_70%)]" />

      {/* Persistent Top Navbar except for full-viewport student dashboard */}
      {!isDashboardOnly && <Navbar />}

      <main
        className={
          isDashboardOnly
            ? 'w-full min-h-screen flex-1'
            : 'mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 flex-1'
        }
      >
        <Outlet />
      </main>

      {/* Footer on public/landing pages */}
      {showFooter && <Footer />}

      <Toaster
        richColors
        closeButton
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '14px',
            border: '1px solid rgba(226, 232, 240, 0.2)',
          },
        }}
      />
    </div>
  )
}
