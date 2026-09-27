import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="grid min-h-svh place-items-center bg-[#fcfcfd] text-sm text-zinc-500">Loading workspace…</div>
  }
  return user ? children : <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
}
