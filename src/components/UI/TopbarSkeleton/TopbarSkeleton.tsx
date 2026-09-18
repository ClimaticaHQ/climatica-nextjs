export function TopbarSkeleton() {
  return (
    <header className="h-16 w-full shrink-0 animate-pulse border-b border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="flex h-full items-center px-4">
        {/* Logo */}
        <div className="flex flex-1 items-center gap-2.5">
          <div className="h-8 w-8 shrink-0 rounded-full bg-[var(--color-border)] md:h-9 md:w-9 lg:h-10 lg:w-10" />
          <div className="h-4 w-24 rounded bg-[var(--color-border)] md:h-[18px] md:w-28 lg:h-5 lg:w-32" />
        </div>

        {/* Desktop center nav */}
        <nav className="hidden gap-3 lg:flex">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-[var(--radius-sm)] bg-[var(--color-border)]" />
          ))}
        </nav>

        {/* Right section */}
        <div className="flex flex-1 items-center justify-end gap-1">
          {/* Desktop language switcher */}
          <div className="hidden lg:block">
            <div className="h-9 w-16 rounded-[var(--radius-sm)] bg-[var(--color-border)]" />
          </div>

          {/* Theme toggle — always visible */}
          <div className="h-10 w-10 rounded-[var(--radius-sm)] bg-[var(--color-border)]" />

          {/* Filter toggle — mobile/tablet only */}
          <div className="h-10 w-10 rounded-[var(--radius-sm)] bg-[var(--color-border)] lg:hidden" />

          {/* Nav burger — mobile/tablet only */}
          <div className="h-10 w-10 rounded-[var(--radius-sm)] bg-[var(--color-border)] lg:hidden" />
        </div>
      </div>
    </header>
  );
}
