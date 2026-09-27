import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useSearchParams } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'

const languageColors = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572a5',
  Java: '#b07219',
  Go: '#00add8',
  Rust: '#dea584',
  HTML: '#e34c26',
  CSS: '#563d7c',
}

const formatNumber = (value) => Number(value ?? 0).toLocaleString('en-US')

function StatCard({ label, value, hint }) {
  return (
    <div className="dashboard-card p-4">
      <div className="text-[11px] font-medium tracking-[0.16em] text-zinc-400">{label}</div>
      <div className="mt-2 text-[26px] font-semibold tracking-tight tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-zinc-400">{hint}</div>}
    </div>
  )
}

function ProfileCard({ profile }) {
  return (
    <section className="dashboard-card p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <img src={profile.avatar} alt="" className="size-20 rounded-2xl ring-1 ring-zinc-200" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{profile.name || profile.username}</h2>
              <a href={profile.profileUrl} target="_blank" rel="noreferrer" className="text-sm text-zinc-500 underline-offset-2 hover:underline">@{profile.username}</a>
            </div>
            <a href={profile.profileUrl} target="_blank" rel="noreferrer" className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50">View on GitHub ↗</a>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">{profile.bio || 'No bio provided.'}</p>
        </div>
      </div>
    </section>
  )
}

function LanguageCard({ repositories }) {
  // Share is over repos that actually report a language, so null-languages drop
  // out of the denominator instead of showing up as a share of zero.
  const { languages, counted } = useMemo(() => {
    const counts = repositories.reduce((accumulator, repo) => {
      if (repo.language) accumulator[repo.language] = (accumulator[repo.language] || 0) + 1
      return accumulator
    }, {})
    const counted = Object.values(counts).reduce((sum, count) => sum + count, 0)
    return {
      counted,
      languages: Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([name, count]) => ({ name, share: counted ? Math.round((count / counted) * 100) : 0 })),
    }
  }, [repositories])

  return (
    <section className="dashboard-card p-5">
      <div className="text-[11px] font-medium tracking-[0.16em] text-zinc-400">LANGUAGES</div>
      <div className="mt-4 space-y-3">
        {languages.length ? languages.map(({ name, share }) => {
          const color = languageColors[name] || '#a1a1aa'
          return (
            <div key={name} className="flex items-center gap-3 text-sm">
              <span className="size-2 shrink-0 rounded-full" style={{ background: color }} />
              <span className="w-20 shrink-0 truncate text-zinc-700">{name}</span>
              <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-100">
                <span className="block h-full rounded-full" style={{ width: `${share}%`, background: color }} />
              </span>
              <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-zinc-400">{share}%</span>
            </div>
          )
        }) : <p className="text-sm text-zinc-500">No languages reported.</p>}
      </div>
      {languages.length > 0 && <p className="mt-4 text-[11px] leading-4 text-zinc-400">Share of the {counted} {counted === 1 ? 'repository' : 'repositories'} reporting a language.</p>}
    </section>
  )
}

function RepositoryList({ repositories }) {
  const [filter, setFilter] = useState('')
  const shown = useMemo(() => {
    const needle = filter.trim().toLowerCase()
    if (!needle) return repositories
    return repositories.filter((repo) => [repo.name, repo.description, repo.language].filter(Boolean).some((field) => field.toLowerCase().includes(needle)))
  }, [filter, repositories])

  return (
    <section className="dashboard-card p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Repositories</h2>
          <p className="mt-0.5 text-sm text-zinc-500">{repositories.length} public {repositories.length === 1 ? 'repository' : 'repositories'}</p>
        </div>
        {filter.trim() && <div className="text-xs text-zinc-400">{shown.length} of {repositories.length} shown</div>}
      </div>
      <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter by name, description or language" aria-label="Filter repositories" className="field mt-5" />
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {repositories.length === 0 ? <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-500 sm:col-span-2">No public repositories found.</div> : shown.length === 0 ? <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-500 sm:col-span-2">No repositories match “{filter.trim()}”.</div> : shown.map((repo) => (
          <article key={repo.url} className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm">
            <a href={repo.url} target="_blank" rel="noreferrer" className="truncate text-sm font-semibold tracking-tight text-zinc-900 underline-offset-2 hover:underline">{repo.name} ↗</a>
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-zinc-500">{repo.description || 'No description provided.'}</p>
            <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-3 text-xs text-zinc-500">
              {repo.language && <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: languageColors[repo.language] || '#a1a1aa' }} />{repo.language}</span>}
              <span>★ {formatNumber(repo.stars)}</span><span>⑂ {formatNumber(repo.forks)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [params, setParams] = useSearchParams()
  const username = params.get('user') || ''
  const [draft, setDraft] = useState(username)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const resultsRef = useRef(null)

  useEffect(() => {
    setDraft(username)
    if (!username) {
      setResult(null)
      return undefined
    }
    let cancelled = false
    setLoading(true)
    setError('')
    api.get(`/github/${encodeURIComponent(username)}`)
      .then(({ data }) => { if (!cancelled) setResult(data) })
      .catch((err) => { if (!cancelled) { setResult(null); setError(err.response?.data?.message || 'Could not reach the analyzer server.') } })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [username])

  // Aggregates cover every repository the API returned, not the filtered view.
  const totals = useMemo(() => {
    const repositories = result?.repositories || []
    return {
      count: repositories.length,
      stars: repositories.reduce((sum, repo) => sum + Number(repo.stars || 0), 0),
      forks: repositories.reduce((sum, repo) => sum + Number(repo.forks || 0), 0),
    }
  }, [result])
  const returnedLabel = `Across ${totals.count} returned ${totals.count === 1 ? 'repository' : 'repositories'}`

  // Scroll only for a user-initiated analysis, not the initial URL load, and only
  // once results have actually rendered.
  const shouldScroll = useRef(false)
  useEffect(() => {
    if (!shouldScroll.current || !result) return
    shouldScroll.current = false
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [result])

  const analyze = (event) => {
    event.preventDefault()
    const value = draft.trim()
    if (!value) return
    shouldScroll.current = true
    setParams({ user: value })
  }

  return (
    <div className="app-shell bg-[#fcfcfd]">
      <div className="flex md:min-h-svh md:flex-row">
        <aside className="flex shrink-0 flex-col gap-4 border-b border-zinc-200 bg-white/80 p-4 backdrop-blur-xl md:sticky md:top-0 md:h-svh md:w-[240px] md:border-b-0 md:border-r md:p-5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-full bg-zinc-900"><span className="size-2.5 rounded-full bg-white" /></span>
            <span className="text-[15px] font-semibold tracking-tight text-zinc-900">GitHub Analyzer</span>
          </Link>

          <div className="min-w-0 border-y border-zinc-100 py-2 md:mt-2">
            <div className="truncate text-sm font-semibold tracking-tight">{user?.name}</div>
            <div className="truncate text-xs text-zinc-500">{user?.email}</div>
          </div>

          <nav className="flex gap-2 md:flex-col md:gap-1">
            <NavLink to="/dashboard" end className={({ isActive }) => `rounded-xl px-3 py-2 text-center text-sm font-medium transition md:text-left ${isActive ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}>Dashboard</NavLink>
            <Link to="/" className="rounded-xl px-3 py-2 text-center text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 md:text-left">Home</Link>
          </nav>

          <p className="hidden rounded-2xl bg-zinc-50 p-3 text-xs leading-5 text-zinc-500 md:block">Analyze public profiles through your authenticated workspace.</p>

          <button onClick={logout} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 md:mt-auto">Logout</button>
        </aside>

        <main className="dashboard-shell min-w-0 flex-1">
          <div className="mx-auto flex max-w-[1160px] flex-col gap-6 px-4 pb-10 sm:px-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div><div className="text-[11px] font-medium tracking-[0.16em] text-zinc-400">GITHUB WORKSPACE</div><h1 className="mt-2 text-[28px] font-semibold tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'there'}.</h1><p className="mt-1 text-sm text-zinc-500">Search a profile and turn public data into useful context.</p></div>
              <div className="text-xs text-zinc-400">Authenticated analyzer</div>
            </div>
            <form onSubmit={analyze} className="dashboard-card mt-6 flex flex-col gap-2 p-2 sm:flex-row"><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Enter a GitHub username" aria-label="GitHub username" className="field border-0 shadow-none focus:border-transparent focus:shadow-none" /><button className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800">Analyze profile <span aria-hidden>→</span></button></form>

            <div ref={resultsRef} className="mt-6 scroll-mt-6 space-y-4">
              {!username &&<div className="dashboard-card border-dashed p-10 text-center"><div className="text-sm font-medium text-zinc-700">Your next profile starts here.</div><p className="mt-1 text-sm text-zinc-500">Enter a GitHub username above to see profile and repository insights.</p></div>}
              {username && loading && <div className="dashboard-card p-10 text-center"><div className="mx-auto size-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" /><p className="mt-4 text-sm text-zinc-500">Loading @{username}…</p></div>}
              {username && error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><strong className="font-semibold">Analysis unavailable.</strong> {error}</div>}
              {result && !loading && (
                <>
                  <ProfileCard profile={result.profile} />
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="REPOSITORIES" value={formatNumber(result.profile.publicRepos)} /><StatCard label="FOLLOWERS" value={formatNumber(result.profile.followers)} /><StatCard label="FOLLOWING" value={formatNumber(result.profile.following)} /><StatCard label="TOTAL STARS" value={formatNumber(totals.stars)} hint={returnedLabel} /></div>
                  <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
                    <LanguageCard repositories={result.repositories} />
                    <section className="dashboard-card flex flex-col p-5 sm:p-6">
                      <div className="text-[11px] font-medium tracking-[0.16em] text-zinc-400">REPOSITORY INSIGHTS</div>
                      <div className="mt-auto pt-6">
                        <div className="flex items-end justify-between gap-4 border-t border-zinc-100 pt-4">
                          <div className="min-w-0">
                            <div className="text-sm text-zinc-500">Total forks</div>
                            <p className="mt-0.5 text-[11px] text-zinc-400">{returnedLabel}</p>
                          </div>
                          <div className="shrink-0 text-[30px] font-semibold tracking-tight tabular-nums">{formatNumber(totals.forks)}</div>
                        </div>
                      </div>
                    </section>
                  </div>
                  <RepositoryList repositories={result.repositories} />
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
