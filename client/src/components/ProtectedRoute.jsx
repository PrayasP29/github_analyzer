import { Navigate } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="grid min-h-svh place-items-center bg-[#fcfcfd] text-sm text-zinc-500">Loading workspace…</div>
  }
  return user ? children : <Navigate to="/login" replace />
}
