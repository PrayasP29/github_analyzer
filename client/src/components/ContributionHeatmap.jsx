import { useMemo } from 'react'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
// Rows 1/3/5 = Mon/Wed/Fri. Two labels would fit too, but three reads better
// without competing with the squares.
const AXIS_WEEKDAYS = [1, 3, 5]

// One cell per day, one column per week, both fixed. `grid-auto-columns` is what
// stops the graph stretching to the card: implicit columns are 12px, never 1fr.
const CELL = 12
const GAP = 3
// A month spanning a single column cannot fit its own name, so it keeps the
// column and renders blank - same rule GitHub's own graph uses.
const MONTH_MIN_WEEKS = 2
const GUTTER = 'w-8 shrink-0'
// Must match GUTTER (w-8) and the row's `gap-2`, so the legend lines up with the
// graph's right edge instead of the card's.
const ROW_INSET = 32 + 8
const columnStyle = { gridAutoColumns: `${CELL}px`, gap: `${GAP}px` }
const dayGridStyle = { ...columnStyle, gridTemplateRows: `repeat(7, ${CELL}px)` }
const monthGridStyle = { ...columnStyle, gridTemplateRows: `${CELL}px` }

const formatCount = (value) => Number(value ?? 0).toLocaleString('en-US')

// `YYYY-MM-DD` is parsed as UTC midnight, which renders as the previous day
// anywhere west of Greenwich, so build a local date out of the parts instead.
const parseDay = (iso) => {
  const [year, month, day] = String(iso).split('-').map(Number)
  return new Date(year, month - 1, day)
}
const formatDay = (iso) =>
  parseDay(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const formatStamp = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

const dayLabel = (day) => {
  const count = Number(day.count ?? 0)
  return `${formatDay(day.date)} — ${count ? `${formatCount(count)} contribution${count === 1 ? '' : 's'}` : 'No contributions'}`
}

function Loading() {
  return (
    <section className="dashboard-card p-5 sm:p-6">
      <div className="eyebrow">CONTRIBUTIONS</div>
      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">Loading contribution activity…</p>
      <div className="mt-4 flex gap-[3px]" aria-hidden>
        {Array.from({ length: 26 }, (_, index) => (
          <span key={index} className="size-2.5 shrink-0 animate-pulse rounded-[2px] bg-zinc-100 dark:bg-zinc-800" style={{ animationDelay: `${index * 22}ms` }} />
        ))}
      </div>
    </section>
  )
}

function Failed({ message }) {
  return (
    <section className="dashboard-card p-5 sm:p-6">
      <div className="eyebrow">CONTRIBUTIONS</div>
      <p role="status" className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
    </section>
  )
}

// Rendering only. Fetching and failure state stay in the dashboard.
export default function ContributionHeatmap({ data, loading, error }) {
  const weeks = data?.calendar?.weeks || []
  const total = Number(data?.calendar?.totalContributions ?? 0)
  const range = [formatStamp(data?.startedAt), formatStamp(data?.endedAt)]

  // Months tile the week columns exactly, so a running sum of totalWeeks places
  // each label without any date arithmetic.
  const months = useMemo(() => {
    const labelled = []
    let week = 0
    for (const month of data?.calendar?.months || []) {
      labelled.push({ ...month, start: week })
      week += month.totalWeeks
    }
    return labelled
  }, [data])

  // The zero level is not in `colors`; take it from a real NONE day so the
  // legend is built entirely from API data.
  const legend = useMemo(() => {
    const colors = data?.calendar?.colors || []
    const none = (data?.calendar?.weeks || []).flatMap((week) => week.contributionDays).find((day) => day.level === 'NONE')?.color
    return none ? [none, ...colors] : colors
  }, [data])

  if (loading) return <Loading />
  if (error) return <Failed message={error} />
  if (!data || !weeks.length) return <Failed message="No contribution data available." />

  return (
    <section className="dashboard-card p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow">CONTRIBUTIONS</div>
          <p className="mt-1.5 text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
            {formatCount(total)} {total === 1 ? 'contribution' : 'contributions'}
            {range[0] && range[1] ? ` · ${range[0]} — ${range[1]}` : ''}
          </p>
        </div>
        {total === 0 && <span className="meta">No contributions recorded in this period.</span>}
      </div>

      <p className="sr-only">
        {formatCount(total)} contributions from {range[0]} to {range[1]}. Each day below lists its own count.
      </p>

      {/* `w-max` sizes the whole block to its content, so the graph sits compact
          at its natural width instead of spreading across the card. Only this
          wrapper scrolls; the page never does. */}
      <div className="mt-5 overflow-x-auto pb-1">
        <div className="w-max">
          <div className="flex gap-2">
            <div className={GUTTER} />
            {/* Same 12px/3px columns and same `start` offsets as the day grid
                below, so labels cannot drift. Narrow months still span their own
                columns - they are just left blank rather than dropped. */}
            <div className="grid" style={monthGridStyle} aria-hidden>
              {months.map((month) => (
                <div
                  key={`${month.year}-${month.name}-${month.firstDay}`}
                  style={{ gridColumn: `${month.start + 1} / span ${month.totalWeeks}`, gridRow: 1 }}
                  className="overflow-hidden whitespace-nowrap text-[10px] font-medium leading-none text-zinc-400 dark:text-zinc-500"
                >
                  {month.totalWeeks >= MONTH_MIN_WEEKS ? month.name : ''}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-1 flex gap-2">
            <div className={`grid ${GUTTER}`} style={{ gridTemplateRows: `repeat(7, ${CELL}px)`, gap: `${GAP}px` }} aria-hidden>
              {DAY_NAMES.map((name, weekday) =>
                AXIS_WEEKDAYS.includes(weekday) ? (
                  <span key={name} className="self-center text-[9px] leading-none text-zinc-400 dark:text-zinc-500" style={{ gridRowStart: weekday + 1 }}>{name}</span>
                ) : null,
              )}
            </div>

            {/* Every day carries its own column (week index) and row (weekday), so
                a short first or last week leaves its remaining cells empty
                instead of being padded with invented days. */}
            <div className="grid" style={dayGridStyle} role="list" aria-label="Daily contributions">
              {weeks.map((week, weekIndex) =>
                week.contributionDays.map((day) => (
                  <div
                    key={day.date}
                    role="listitem"
                    title={dayLabel(day)}
                    className="rounded-[2px] ring-inset transition hover:scale-125 hover:ring-1 hover:ring-zinc-500/70"
                    style={{ gridRow: day.weekday + 1, gridColumn: weekIndex + 1, width: CELL, height: CELL, background: day.color }}
                  />
                )),
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[10px] text-zinc-400 dark:text-zinc-500" style={{ width: ROW_INSET + weeks.length * (CELL + GAP) - GAP, maxWidth: '100%' }}>
        <div className={GUTTER} />
        <div className="flex flex-1 items-center justify-end gap-2">
          <span>Less</span>
          {legend.map((color, index) => (
            <span key={`${color}-${index}`} className="shrink-0 rounded-[2px]" style={{ width: CELL, height: CELL, background: color }} />
          ))}
          <span>More</span>
        </div>
      </div>
    </section>
  )
}
