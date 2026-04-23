import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Tailwind-friendly className merge helper
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatScore(value) {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return '0.0'
  return numberValue.toFixed(1)
}

export function averageRating(reviews = []) {
  if (!Array.isArray(reviews) || reviews.length === 0) return 0
  const sum = reviews.reduce((acc, item) => acc + Number(item?.rating || 0), 0)
  return sum / reviews.length
}
