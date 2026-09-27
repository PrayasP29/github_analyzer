import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import Navbar from '@/components/Navbar'
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
  const languages = useMemo(() => {
    const counts = repositories.reduce((accumulator, repo) => {
      if (repo.language) accumulator[repo.language] = (accumulator[repo.language] || 0) + 1
      return accumulator
    }, {})
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0) || 1
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, share: Math.round((count / total) * 100) }))
  }, [repositories])

  return (
    <section className="dashboard-card p-5">
      <div className="text-[11px] font-medium tracking-[0.16em] text-zinc-400">LANGUAGES</div>
      <div className="mt-4 space-y-3">
        {languages.length ? languages.map((language) => (
          <div key={language.name} className="flex items-center gap-3 text-sm">
            <span className="size-2 rounded-full" style={{ background: languageColors[language.name] || '#a1a1aa' }} />
            <span className="text-zinc-700">{language.name}</span>
            <span className="ml-auto font-mono text-xs text-zinc-400">{language.share}%</span>
          </div>
        )) : <p className="text-sm text-zinc-500">No languages reported.</p>}
      </div>
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
        <div><div className="text-[11px] font-medium tracking-[0.16em] text-zinc-400">REPOSITORIES</div><h2 className="mt-1 text-lg font-semibold tracking-tight">Public work</h2></div>
        <div className="text-xs text-zinc-400">{shown.length} of {repositories.length} shown</div>
      </div>
      <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter by name, description or language" aria-label="Filter repositories" className="field mt-5" />
      <div className="mt-4 space-y-2">
        {repositories.length === 0 ? <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-500">No public repositories found.</div> : shown.length === 0 ? <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-500">No repositories match “{filter.trim()}”.</div> : shown.map((repo) => (
          <article key={repo.url} className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <a href={repo.url} target="_blank" rel="noreferrer" className="truncate text-sm font-semibold tracking-tight text-zinc-900 underline-offset-2 hover:underline">{repo.name} ↗</a>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-zinc-500">{repo.description || 'No description provided.'}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                  {repo.language && <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: languageColors[repo.language] || '#a1a1aa' }} />{repo.language}</span>}
                  <span>★ {formatNumber(repo.stars)}</span><span>⑂ {formatNumber(repo.forks)}</span>
                </div>
              </div>
              <a href={repo.url} target="_blank" rel="noreferrer" className="shrink-0 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50">Open repository</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const username = params.get('user') || ''
  const [draft, setDraft] = useState(username)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

  const totals = useMemo(() => {
    const repositories = result?.repositories || []
    return {
      stars: repositories.reduce((sum, repo) => sum + Number(repo.stars || 0), 0),
      forks: repositories.reduce((sum, repo) => sum + Number(repo.forks || 0), 0),
    }
  }, [result])

  const analyze = (event) => {
    event.preventDefault()
    const value = draft.trim()
    if (value) setParams({ user: value })
  }

  return (
    <div className="app-shell bg-[#fcfcfd]">
      <Navbar />
      <main className="dashboard-shell">
        <div className="mx-auto flex max-w-[1160px] flex-col gap-6 px-4 pb-10 sm:px-6 md:flex-row">
          <aside className="dashboard-card h-fit shrink-0 p-4 md:sticky md:top-24 md:w-[220px]">
            <div className="border-b border-zinc-100 px-1 pb-3"><div className="truncate text-sm font-semibold tracking-tight">{user?.name}</div><div className="truncate text-xs text-zinc-500">{user?.email}</div></div>
            <nav className="mt-3 space-y-1"><Link to="/dashboard" className="block rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white">Dashboard</Link><Link to="/" className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900">Home</Link></nav>
            <div className="mt-4 rounded-2xl bg-zinc-50 p-3 text-xs leading-5 text-zinc-500">Analyze public profiles through your authenticated workspace.</div>
          </aside>

          <section className="min-w-0 flex-1">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div><div className="text-[11px] font-medium tracking-[0.16em] text-zinc-400">GITHUB WORKSPACE</div><h1 className="mt-2 text-[28px] font-semibold tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'there'}.</h1><p className="mt-1 text-sm text-zinc-500">Search a profile and turn public data into useful context.</p></div>
              <div className="text-xs text-zinc-400">Authenticated analyzer</div>
            </div>
            <form onSubmit={analyze} className="dashboard-card mt-6 flex flex-col gap-2 p-2 sm:flex-row"><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Enter a GitHub username" aria-label="GitHub username" className="field border-0 shadow-none focus:border-transparent focus:shadow-none" /><button className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800">Analyze profile <span aria-hidden>→</span></button></form>

            <div className="mt-6 space-y-4">
              {!username && <div className="dashboard-card border-dashed p-10 text-center"><div className="text-sm font-medium text-zinc-700">Your next profile starts here.</div><p className="mt-1 text-sm text-zinc-500">Enter a GitHub username above to see profile and repository insights.</p></div>}
              {username && loading && <div className="dashboard-card p-10 text-center"><div className="mx-auto size-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" /><p className="mt-4 text-sm text-zinc-500">Loading @{username}…</p></div>}
              {username && error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><strong className="font-semibold">Analysis unavailable.</strong> {error}</div>}
              {result && !loading && (
                <>
                  <ProfileCard profile={result.profile} />
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="REPOSITORIES" value={formatNumber(result.profile.publicRepos)} /><StatCard label="FOLLOWERS" value={formatNumber(result.profile.followers)} /><StatCard label="FOLLOWING" value={formatNumber(result.profile.following)} /><StatCard label="TOTAL STARS" value={formatNumber(totals.stars)} hint="Across returned repos" /></div>
                  <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]"><LanguageCard repositories={result.repositories} /><div className="dashboard-card p-5"><div className="text-[11px] font-medium tracking-[0.16em] text-zinc-400">FORKS</div><div className="mt-2 text-[30px] font-semibold tracking-tight tabular-nums">{formatNumber(totals.forks)}</div><p className="mt-1 text-xs text-zinc-400">Across returned repositories</p></div></div>
                  <RepositoryList repositories={result.repositories} />
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
