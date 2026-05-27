import type { TStatCardsSkeletonProps } from "./StatCardsSkeleton.type";

export function StatCardsSkeleton({ count = 4 }: TStatCardsSkeletonProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3"
        >
          <div className="h-3 w-20 rounded bg-[var(--color-border)]" />
          <div className="h-9 w-28 rounded bg-[var(--color-border)]" />
        </div>
      ))}
    </div>
  );
}
