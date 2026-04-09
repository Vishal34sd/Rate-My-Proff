import React from 'react'
import { Toaster } from 'sonner'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import HomePage from './pages/HomePage'
import AddProfessorPage from './pages/AddProfessorPage'
import NotFoundPage from './pages/NotFoundPage'
import ProfessorDetailPage from './pages/ProfessorDetailPage'
import ReviewPage from './pages/ReviewPage'
import LeaderboardPage from './pages/LeaderboardPage'
import RootLayout from './pages/RootLayout'
import { AppDataProvider } from './lib/app-context'
import {
  getProfessorsFromStorage,
  saveProfessorsToStorage,
} from './lib/storage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'professor/:id',
        element: <ProfessorDetailPage />,
      },
      {
        path: 'review',
        element: <ReviewPage />,
      },
      {
        path: 'add-professor',
        element: <AddProfessorPage />,
      },
      {
        path: 'leaderboard',
        element: <LeaderboardPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

function normalizeName(name) {
  return name.trim().toLowerCase()
}

function App() {
  const [professors, setProfessors] = React.useState(() => getProfessorsFromStorage())

  React.useEffect(() => {
    saveProfessorsToStorage(professors)
  }, [professors])

  React.useEffect(() => {
    const root = document.documentElement
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
  }, [])

  const addProfessor = React.useCallback((professorData) => {
    setProfessors((prev) => {
      const alreadyExists = prev.some(
        (professor) => normalizeName(professor.name) === normalizeName(professorData.name),
      )

      if (alreadyExists) {
        return prev
      }

      return [
        {
          id: `prof-${Date.now()}`,
          name: professorData.name,
          post: professorData.post || 'Professor',
          experience: professorData.experience || 'Not specified',
          qualification: professorData.qualification || 'Not specified',
          email: professorData.email || 'not-available@university.edu',
          phone: professorData.phone || 'Not available',
          image:
            professorData.image ||
            'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80',
          reviews: [],
        },
        ...prev,
      ]
    })
  }, [])

  const addReview = React.useCallback((reviewData) => {
    setProfessors((prev) => {
      const normalizedInput = normalizeName(reviewData.professorName)
      const professorIndex = prev.findIndex((professor) => normalizeName(professor.name) === normalizedInput)

      const nextReview = {
        id: `rev-${Date.now()}`,
        teaching: reviewData.teaching,
        leniency: reviewData.leniency,
        attendance: reviewData.attendance,
        examChecking: reviewData.examChecking,
        comment: reviewData.comment,
        createdAt: new Date().toISOString(),
      }

      if (professorIndex >= 0) {
        const updated = [...prev]
        updated[professorIndex] = {
          ...updated[professorIndex],
          reviews: [nextReview, ...updated[professorIndex].reviews],
        }
        return updated
      }

      return [
        {
          id: `prof-${Date.now()}`,
          name: reviewData.professorName,
          post: reviewData.post || 'Professor',
          experience: reviewData.experience || 'Not specified',
          qualification: reviewData.qualification || 'Not specified',
          email: reviewData.email || 'not-available@university.edu',
          phone: reviewData.phone || 'Not available',
          image:
            reviewData.image ||
            'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80',
          reviews: [nextReview],
        },
        ...prev,
      ]
    })
  }, [])

  const removeProfessor = React.useCallback((professorId) => {
    setProfessors((prev) => prev.filter((professor) => professor.id !== professorId))
  }, [])

  return (
    <AppDataProvider value={{ professors, addReview, addProfessor, removeProfessor }}>
      <RouterProvider router={router} />
      <Toaster theme="dark" position="top-right" richColors />
    </AppDataProvider>
  )
}

export default App
