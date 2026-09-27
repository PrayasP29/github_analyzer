export function Widget({ title, meta, children }) {
  return (
    <section className="@container flex h-full min-h-0 flex-col gap-4 p-4 sm:p-[22px]">
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[14px] leading-none">
        <h3 className="truncate text-[12px] tracking-[0.1em] text-muted-foreground uppercase">
          {title}
        </h3>
        {meta && <span className="shrink-0 text-muted-foreground">{meta}</span>}
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  )
}

export function Stat({ children, unit }) {
  return (
    <p className="text-[28px] leading-none font-normal tracking-tight text-foreground tabular-nums @[240px]:text-[30px]">
      {children}
      {unit && (
        <span className="text-[13px] tracking-normal text-muted-foreground">
          {' '}
          {unit}
        </span>
      )}
    </p>
  )
}
