import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { getRole, isLoggedIn } from '../utils/auth'

// Simple route guard for protected routes.
// Uses localStorage token; backend still enforces auth.
export function RequireAuth({ allowedRoles }) {
  const location = useLocation()

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (allowedRoles?.length) {
    const role = getRole()
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/" replace />
    }
  }

  return <Outlet />
}
