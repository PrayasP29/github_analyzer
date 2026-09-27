import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'

export default function Login() {
  const { login, user, loading: authLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!authLoading && user) return <Navigate to={location.state?.from || '/dashboard'} replace />

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(form.email.trim(), form.password)
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not reach the server.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-shell bg-[#fcfcfd]">
      <Navbar />
      <main className="mx-auto max-w-[1160px] px-4 pb-12 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto grid max-w-[980px] overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm lg:grid-cols-2">
          <section className="flex min-h-[520px] flex-col justify-between bg-zinc-900 p-8 text-white sm:p-10">
            <div>
              <div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-full bg-white"><span className="size-2.5 rounded-full bg-zinc-900" /></span><span className="font-semibold tracking-tight">GitHub Analyzer</span></div>
              <h1 className="mt-8 text-[30px] font-semibold leading-tight tracking-tight">Welcome back.</h1>
              <p className="mt-2 max-w-sm text-sm leading-6 text-white/60">Sign in to continue exploring profiles, repositories and the signals that matter.</p>
              <ul className="mt-7 space-y-2 text-xs text-white/50"><li>• Real public GitHub data</li><li>• Searchable repository insights</li><li>• One focused dashboard</li></ul>
            </div>
            <div className="text-xs text-white/40">New here? <Link to="/signup" className="text-white underline">Create an account</Link></div>
          </section>
          <section className="p-6 sm:p-10">
            <h2 className="text-[20px] font-semibold tracking-tight">Log in</h2>
            <p className="mt-1 text-sm text-zinc-500">Use your analyzer account.</p>
            <form onSubmit={submit} className="mt-7 space-y-4">
              <label className="block text-xs font-medium text-zinc-700">Email<input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@domain.com" className="field mt-1.5" /></label>
              <label className="block text-xs font-medium text-zinc-700">Password<input required type="password" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Your password" className="field mt-1.5" /></label>
              {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
              <button disabled={busy} className="w-full rounded-full bg-zinc-900 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50">{busy ? 'Signing in…' : 'Sign in'}</button>
              <p className="text-center text-xs text-zinc-500">No account? <Link to="/signup" className="font-medium text-zinc-900 underline">Sign up</Link></p>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
