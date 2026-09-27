import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { api } from '@/services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setLoading(false)
      return
    }
    api
      .get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      // The backend's register endpoint returns no token, so signup only
      // creates the account — the caller sends the user to /login after.
      async register(name, email, password) {
        await api.post('/auth/register', { name, email, password })
      },
      async login(email, password) {
        const { data } = await api.post('/auth/login', { email, password })
        localStorage.setItem('token', data.token)
        setUser(data.user)
      },
      logout() {
        localStorage.removeItem('token')
        setUser(null)
      },
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
