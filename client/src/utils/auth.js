const TOKEN_KEY = 'rmp_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// NOTE: This is NOT verification; it's only for client-side routing.
export function parseJwt(token) {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    // base64url -> base64
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(normalized)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function getUserFromToken() {
  const token = getToken()
  if (!token) return null
  return parseJwt(token)
}

export function getRole() {
  return getUserFromToken()?.role ?? null
}

export function isLoggedIn() {
  return Boolean(getToken())
}
