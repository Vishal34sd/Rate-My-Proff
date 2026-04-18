import { Outlet } from 'react-router-dom'

import Navbar from '../components/Navbar'

function RootLayout() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-(--ui-page-bg) text-(--ui-text) transition-colors duration-300">
      <Navbar />
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-14 pt-8 md:px-6">
        <Outlet />
      </main>
    </div>
  )
}

export default RootLayout
