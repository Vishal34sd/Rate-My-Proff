import { defaultProfessors } from '../data/defaultData'

const STORAGE_KEY = 'rate-my-professors-data-v1'
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80'

function deepClone(value) {
  return JSON.parse(JSON.stringify(value))
}

function normalizeProfessor(professor) {
  return {
    id: professor.id || `prof-${Date.now()}`,
    name: professor.name || 'Unknown Professor',
    post: professor.post || 'Professor',
    experience: professor.experience || 'Not specified',
    qualification: professor.qualification || 'Not specified',
    email: professor.email || 'not-available@university.edu',
    phone: professor.phone || 'Not available',
    image: professor.image || DEFAULT_IMAGE,
    reviews: Array.isArray(professor.reviews) ? professor.reviews : [],
  }
}

function normalizeAll(professors) {
  return professors.map(normalizeProfessor)
}

export function initializeProfessorData() {
  const existing = localStorage.getItem(STORAGE_KEY)

  if (!existing) {
    const seeded = normalizeAll(deepClone(defaultProfessors))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
    return seeded
  }

  try {
    const parsed = JSON.parse(existing)

    if (!Array.isArray(parsed)) {
      const seeded = normalizeAll(deepClone(defaultProfessors))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
      return seeded
    }

    const normalized = normalizeAll(parsed)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
    return normalized
  } catch {
    const seeded = normalizeAll(deepClone(defaultProfessors))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
    return seeded
  }
}

export function getProfessorsFromStorage() {
  return initializeProfessorData()
}

export function saveProfessorsToStorage(professors) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(professors))
}
