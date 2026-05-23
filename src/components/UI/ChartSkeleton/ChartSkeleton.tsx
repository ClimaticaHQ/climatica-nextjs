const BAR_HEIGHTS = [60, 80, 45, 70, 90, 85, 95, 88, 75, 55, 50, 65] as const;

export function ChartSkeleton() {
  return (
    <div className="w-full animate-pulse rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-sm">
      <div className="mb-4 flex gap-2">
        <div className="h-7 w-20 rounded-full bg-[var(--color-border)]" />
        <div className="h-7 w-24 rounded-full bg-[var(--color-border)]" />
      </div>
      <div className="relative flex h-64 items-end justify-between px-2">
        {BAR_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="w-6 rounded-sm bg-[var(--color-border)]"
            style={{ height: `${h}%` }}
          />
        ))}
        <div className="pointer-events-none absolute inset-x-0 top-[35%] h-px bg-[var(--color-border)] opacity-60" />
        <div className="pointer-events-none absolute inset-x-0 top-[55%] h-px bg-[var(--color-border)] opacity-40" />
      </div>
      <div className="mt-2 flex justify-between px-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-3 w-6 rounded bg-[var(--color-border)]" />
        ))}
      </div>
    </div>
  );
}
