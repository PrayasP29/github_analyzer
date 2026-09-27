import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Navbar from '@/components/Navbar'
import Reveal from '@/components/Reveal'
import WarpTunnel from '@/components/WarpTunnel'

const features = [
  ['Profile intelligence', 'See identity, bio, followers and public activity in one calm overview.'],
  ['Repository signal', 'Compare stars, forks and languages without opening ten browser tabs.'],
  ['Useful by default', 'Search, filter and jump straight to the repositories worth exploring.'],
]

export default function Home() {
  const [username, setUsername] = useState('')
  const navigate = useNavigate()
  const analyze = (event) => {
    event.preventDefault()
    const value = username.trim()
    if (value) navigate(`/dashboard?user=${encodeURIComponent(value)}`)
  }

  return (
    <div className="app-shell relative isolate overflow-hidden bg-[#050508] text-white">
      <Navbar />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,#10131d_0%,#0a0a0f_48%,#050508_100%)]" />
        <WarpTunnel className="absolute inset-0 h-full w-full opacity-75 [filter:drop-shadow(0_0_6px_rgba(120,200,255,0.35))]" />
        <div className="landing-grid absolute inset-0 opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50" />
      </div>

      <main className="relative mx-auto flex w-[calc(100%-2rem)] max-w-[1160px] flex-col gap-8 py-8 sm:gap-12 sm:py-12">
        <section className="flex min-h-[82svh] flex-col justify-center px-2 pt-16 sm:px-6">
          <div className="mx-auto flex max-w-[900px] flex-col items-center text-center">
            <Reveal repeat>
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-4 py-1.5 backdrop-blur-md">
                <span className="grid size-9 place-items-center rounded-full bg-white shadow-lg"><span className="size-3.5 rounded-full bg-zinc-900" /></span>
                <span className="hidden rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-medium tracking-widest text-white/70 sm:inline-flex">PUBLIC SIGNAL</span>
              </div>
            </Reveal>
            <Reveal delay={110} repeat>
              <h1 className="mt-8 max-w-4xl text-[54px] font-bold italic leading-[0.95] tracking-[-0.06em] text-white sm:text-[82px] lg:text-[104px]">GitHub Profile Analyzer</h1>
            </Reveal>
            <Reveal delay={220} repeat>
              <p className="mx-auto mt-5 max-w-[660px] text-[18px] font-medium leading-tight tracking-tight text-white/70 sm:text-[22px] lg:text-[26px]">Understand any GitHub profile in one dashboard.</p>
            </Reveal>
            <Reveal delay={330} repeat className="w-full">
              <form onSubmit={analyze} className="mx-auto mt-9 flex w-full max-w-[620px] flex-col gap-2 rounded-2xl border border-white/15 bg-white/[0.08] p-2 backdrop-blur-md sm:flex-row">
                <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter a GitHub username" aria-label="GitHub username" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40" />
                <button type="submit" className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-white/90">Analyze profile <span aria-hidden>→</span></button>
              </form>
            </Reveal>
            <Reveal delay={420} repeat>
              <p className="mt-4 text-xs text-white/45">Sign in to save your workspace. <Link to="/login" className="text-white underline underline-offset-2">Log in</Link> or <Link to="/signup" className="text-white underline underline-offset-2">create an account</Link>.</p>
            </Reveal>
          </div>
        </section>

        <section id="how-it-works" className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/50 backdrop-blur-lg sm:p-12">
          <Reveal className="mx-auto max-w-[720px] text-center">
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-widest text-white/60">WHY ANALYZE</span>
            <h2 className="mt-3 text-[28px] font-semibold tracking-tight text-white sm:text-[34px]">The signal behind the profile.</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">A focused workspace for understanding the people and projects behind a GitHub username.</p>
          </Reveal>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {features.map(([title, description], index) => (
              <Reveal key={title} delay={index * 110}>
                <article className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="grid size-7 place-items-center rounded-full border border-white/10 bg-white/5 text-[11px] text-white/70">◆</div>
                  <h3 className="mt-3 text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-[13px] leading-5 text-white/60">{description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="faq" className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/50 backdrop-blur-lg sm:p-12">
          <Reveal>
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-widest text-white/60">HOW IT WORKS</span>
                <h2 className="mt-3 text-[28px] font-semibold tracking-tight">One username. A clearer picture.</h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-white/60">Search a public profile through the authenticated analyzer, then explore real repository data fetched by the backend.</p>
            </div>
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {['Enter a username', 'Review the profile', 'Explore repositories'].map((step, index) => (
                <div key={step} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="font-mono text-[11px] tracking-widest text-white/40">0{index + 1}</div>
                  <div className="mt-2 text-base font-semibold">{step}</div>
                  <div className="mt-1 text-[13px] leading-5 text-white/60">{['Use the search experience above or open the dashboard.', 'See avatar, bio, counts and profile link at a glance.', 'Filter by name, description or language and open GitHub directly.'][index]}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <footer className="rounded-3xl border border-white/10 bg-white/[0.035] px-6 py-8 text-white sm:px-12">
          <div className="flex flex-col justify-between gap-6 sm:flex-row">
            <div className="max-w-sm">
              <div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-full bg-white"><span className="size-2.5 rounded-full bg-zinc-900" /></span><span className="font-semibold tracking-tight">GitHub Profile Analyzer</span></div>
              <p className="mt-3 text-[13px] leading-5 text-white/55">A focused way to understand public GitHub profiles, repositories and project signals.</p>
            </div>
            <div className="flex gap-8 text-sm text-white/60"><Link to="/login" className="hover:text-white">Login</Link><Link to="/signup" className="hover:text-white">Sign up</Link><Link to="/dashboard" className="hover:text-white">Dashboard</Link></div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-5 text-xs text-white/35">© {new Date().getFullYear()} GitHub Profile Analyzer · public data, clear decisions.</div>
        </footer>
      </main>
    </div>
  )
}
