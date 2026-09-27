import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'

export default function Signup() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    if (form.password !== form.confirm) return setError('Passwords do not match.')
    setBusy(true)
    try {
      await register(form.name.trim(), form.email.trim().toLowerCase(), form.password)
      setMessage('Account created. Taking you to login…')
      window.setTimeout(() => navigate('/login'), 900)
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
          <section className="flex min-h-[560px] flex-col justify-between bg-zinc-900 p-8 text-white sm:p-10">
            <div>
              <div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-full bg-white"><span className="size-2.5 rounded-full bg-zinc-900" /></span><span className="font-semibold tracking-tight">GitHub Analyzer</span></div>
              <h1 className="mt-8 text-[30px] font-semibold leading-tight tracking-tight">Build a clearer profile view.</h1>
              <p className="mt-2 max-w-sm text-sm leading-6 text-white/60">Create your workspace and keep the people and projects you analyze close at hand.</p>
              <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4"><div className="font-mono text-[11px] tracking-widest text-white/40">WHAT HAPPENS NEXT</div><div className="mt-2 text-sm font-medium">Create → Sign in → Analyze</div><div className="mt-1 text-xs text-white/50">Your account unlocks the authenticated GitHub analysis endpoint.</div></div>
            </div>
            <div className="text-xs text-white/40">Already registered? <Link to="/login" className="text-white underline">Log in</Link></div>
          </section>
          <section className="p-6 sm:p-10">
            <h2 className="text-[20px] font-semibold tracking-tight">Create an account</h2>
            <p className="mt-1 text-sm text-zinc-500">Start with your name, email and a password.</p>
            <form onSubmit={submit} className="mt-7 space-y-4">
              <label className="block text-xs font-medium text-zinc-700">Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Alex Carter" className="field mt-1.5" /></label>
              <label className="block text-xs font-medium text-zinc-700">Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@domain.com" className="field mt-1.5" /></label>
              <label className="block text-xs font-medium text-zinc-700">Password<input required type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters" className="field mt-1.5" /></label>
              <label className="block text-xs font-medium text-zinc-700">Confirm password<input required type="password" value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} placeholder="Repeat password" className="field mt-1.5" /></label>
              {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
              {message && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</div>}
              <button disabled={busy || Boolean(message)} className="w-full rounded-full bg-zinc-900 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50">{busy ? 'Creating…' : 'Create account'}</button>
              <p className="text-center text-xs text-zinc-500">Already have an account? <Link to="/login" className="font-medium text-zinc-900 underline">Sign in</Link></p>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
