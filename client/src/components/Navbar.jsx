import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const links = [
    { label: 'Home', to: '/' },
    { label: 'How it works', to: '/#how-it-works' },
    { label: 'FAQ', to: '/#faq' },
  ]

  const goToAnchor = (event, to) => {
    if (!to.includes('#')) return
    event.preventDefault()
    const id = to.split('#')[1]
    if (location.pathname !== '/') navigate('/')
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 40)
    setOpen(false)
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-[1160px] px-4 pt-4 sm:px-6 sm:pt-5">
        <nav className="pointer-events-auto flex items-center justify-between gap-3 rounded-full border border-zinc-200/70 bg-white/85 px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:px-4">
          <Link to="/" className="flex shrink-0 items-center gap-2.5 pl-1" onClick={() => setOpen(false)}>
            <span className="grid size-7 place-items-center rounded-full bg-zinc-900">
              <span className="size-2.5 rounded-full bg-white" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-zinc-900">GitHub Analyzer</span>
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-zinc-200/60 bg-zinc-900/[0.04] p-1 md:flex">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.to}
                onClick={(event) => goToAnchor(event, link.to)}
                className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${location.pathname === link.to ? 'border border-zinc-200 bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
                  }`}>
                {link.label}
              </a>
            ))}
            {user && (
              <NavLink to="/dashboard" className="rounded-full px-4 py-1.5 text-[13px] font-medium text-zinc-600 hover:text-zinc-900">
                Dashboard
              </NavLink>
            )}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <span className="max-w-28 truncate px-2 text-xs text-zinc-500">{user.name}</span>
                <button onClick={logout} className="rounded-full px-4 py-2 text-[13px] font-medium text-zinc-600 transition hover:bg-zinc-100">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-full px-4 py-2 text-[13px] font-medium text-zinc-700 transition hover:bg-zinc-100">Login</Link>
                <Link to="/signup" className="rounded-full bg-zinc-900 px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-zinc-800">Get started</Link>
              </>
            )}
          </div>

          <button aria-label="Toggle menu" onClick={() => setOpen((value) => !value)} className="grid size-9 place-items-center rounded-full bg-zinc-900 text-[12px] font-mono text-white md:hidden">
            {open ? '×' : '≡'}
          </button>
        </nav>

        {open && (
          <div className="pointer-events-auto mt-2 space-y-1 rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl md:hidden">
            {links.map((link) => (
              <a key={link.label} href={link.to} onClick={(event) => goToAnchor(event, link.to)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50">{link.label}</a>
            ))}
            <Link to="/dashboard" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Dashboard</Link>
            <div className="my-1 h-px bg-zinc-100" />
            {user ? (
              <button onClick={() => { setOpen(false); logout() }} className="w-full rounded-full border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700">Logout</button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="rounded-full border border-zinc-200 px-4 py-2.5 text-center text-sm font-medium">Login</Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="rounded-full bg-zinc-900 px-4 py-2.5 text-center text-sm font-semibold text-white">Get started</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
