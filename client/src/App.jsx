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

function hasProfessorWithSameName(professors, name) {
  return professors.some((professor) => normalizeName(professor.name) === normalizeName(name))
}

function createProfessorRecord(data, reviews = []) {
  return {
    id: `prof-${Date.now()}`,
    name: data.name,
    post: data.post || 'Professor',
    experience: data.experience || 'Not specified',
    qualification: data.qualification || 'Not specified',
    email: data.email || 'not-available@university.edu',
    phone: data.phone || 'Not available',
    image:
      data.image ||
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80',
    reviews,
  }
}

function createReviewRecord(data) {
  return {
    id: `rev-${Date.now()}`,
    teaching: data.teaching,
    leniency: data.leniency,
    attendance: data.attendance,
    examChecking: data.examChecking,
    comment: data.comment,
    createdAt: new Date().toISOString(),
  }
}

function findProfessorIndexByName(professors, professorName) {
  const normalizedInput = normalizeName(professorName)
  return professors.findIndex((professor) => normalizeName(professor.name) === normalizedInput)
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

  const addProfessor = (professorData) => {
    const name = String(professorData?.name ?? '').trim()

    if (!name) {
      return
    }

    setProfessors((prev) => {
      const nameKey = name.toLowerCase()
      const alreadyExists = prev.some(
        (professor) => String(professor?.name ?? '').trim().toLowerCase() === nameKey,
      )

      if (alreadyExists) {
        return prev
      }

      const nextProfessor = createProfessorRecord({ ...professorData, name })
      return [nextProfessor, ...prev]
    })
  }

  const addReview = React.useCallback((reviewData) => {
    setProfessors((prev) => {
      const professorIndex = findProfessorIndexByName(prev, reviewData.professorName)
      const nextReview = createReviewRecord(reviewData)

      if (professorIndex >= 0) {
        const updated = [...prev]
        updated[professorIndex] = {
          ...updated[professorIndex],
          reviews: [nextReview, ...updated[professorIndex].reviews],
        }
        return updated
      }

      return [createProfessorRecord({ ...reviewData, name: reviewData.professorName }, [nextReview]), ...prev]
    })
  }, [])

  const removeProfessor = (professorId) => {
    if (!professorId) {
      return
    }

    setProfessors((prev) => prev.filter((professor) => professor.id !== professorId))
  }

  return (
    <AppDataProvider value={{ professors, addReview, addProfessor, removeProfessor }}>
      <RouterProvider router={router} />
      <Toaster theme="dark" position="top-right" richColors />
    </AppDataProvider>
  )
}

export default App ;
