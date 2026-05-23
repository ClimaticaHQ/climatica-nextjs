import type { TComparisonTableSkeletonProps } from "./ComparisonTableSkeleton.type";

const ROW_COUNT = 5;

export function ComparisonTableSkeleton({ cols = 2 }: TComparisonTableSkeletonProps) {
  return (
    <div className="animate-pulse overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
      <table className="w-full table-fixed text-[length:var(--font-sm)]">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            <th className="h-11 px-4 py-2.5" />
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="h-11 px-4 py-2.5">
                <div className="flex items-center justify-center gap-1.5">
                  <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--color-border)]" />
                  <div className="h-3 w-16 rounded bg-[var(--color-border)]" />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: ROW_COUNT }).map((_, i) => (
            <tr
              key={i}
              className={`border-b border-[var(--color-border)] last:border-b-0 ${i % 2 === 0 ? "bg-[var(--color-bg)]" : "bg-[var(--color-bg-secondary)]"}`}
            >
              <td className="h-11 px-4 py-2.5">
                <div className="h-4 w-24 rounded bg-[var(--color-border)]" />
              </td>
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="h-11 px-4 py-2.5">
                  <div className="mx-auto h-5 w-20 rounded bg-[var(--color-border)]" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
