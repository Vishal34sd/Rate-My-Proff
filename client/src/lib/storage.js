import { defaultProfessors } from '../data/defaultData'

const STORAGE_KEY = 'rate-my-professors-data-v1'
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80'

function normalizeName(value) {
  return String(value ?? '').trim().toLowerCase()
}

const DEFAULT_IMAGE_BY_ID = new Map(defaultProfessors.map((professor) => [professor.id, professor.image]))
const DEFAULT_IMAGE_BY_NAME = new Map(
  defaultProfessors.map((professor) => [normalizeName(professor.name), professor.image]),
)

const LEGACY_DEFAULT_IMAGES = new Set([
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q0',
  'https://www.istockphoto.com/photos/male-professor',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsp',
])

function deepClone(value) {
  return JSON.parse(JSON.stringify(value))
}

function getDefaultImageForProfessor(professor) {
  if (!professor) {
    return undefined
  }

  if (professor.id && DEFAULT_IMAGE_BY_ID.has(professor.id)) {
    return DEFAULT_IMAGE_BY_ID.get(professor.id)
  }

  const nameKey = normalizeName(professor.name)
  if (nameKey && DEFAULT_IMAGE_BY_NAME.has(nameKey)) {
    return DEFAULT_IMAGE_BY_NAME.get(nameKey)
  }

  return undefined
}

function shouldReplaceLegacyImage(professor) {
  const nextDefaultImage = getDefaultImageForProfessor(professor)
  if (!nextDefaultImage) {
    return false
  }

  const image = professor.image

  if (!image) {
    return true
  }

  if (typeof image !== 'string') {
    return true
  }

  if (image.startsWith('data:image/')) {
    return false
  }

  if (LEGACY_DEFAULT_IMAGES.has(image)) {
    return true
  }

  if (image.includes('istockphoto.com/photos')) {
    return true
  }

  if (image.startsWith('https://images.unsp')) {
    return true
  }

  if (image === DEFAULT_IMAGE) {
    return true
  }

  return false
}

function migrateDefaultProfessorImages(professors) {
  return professors.map((professor) => {
    if (!shouldReplaceLegacyImage(professor)) {
      return professor
    }

    const nextDefaultImage = getDefaultImageForProfessor(professor)
    if (!nextDefaultImage) {
      return professor
    }

    return {
      ...professor,
      image: nextDefaultImage,
    }
  })
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

function seedDefaults() {
  const seeded = normalizeAll(deepClone(defaultProfessors))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
  return seeded
}

function saveAndReturnNormalized(professors) {
  const normalized = normalizeAll(professors)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

export function initializeProfessorData() {
  const existing = localStorage.getItem(STORAGE_KEY)

  if (!existing) {
    return seedDefaults()
  }

  try {
    const parsed = JSON.parse(existing)

    if (!Array.isArray(parsed)) {
      return seedDefaults()
    }

    const migrated = migrateDefaultProfessorImages(parsed)
    return saveAndReturnNormalized(migrated)
  } catch {
    return seedDefaults()
  }
}

export function getProfessorsFromStorage() {
  return initializeProfessorData()
}

export function saveProfessorsToStorage(professors) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(professors))
  
}
