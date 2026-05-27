import type { TTableSkeletonProps } from "./TableSkeleton.type";

export function TableSkeleton({ rows = 5, cols = 2 }: TTableSkeletonProps) {
  return (
    <div className="animate-pulse overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
      <table className="w-full table-fixed text-[length:var(--font-sm)]">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            <th className="px-4 py-2.5" />
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-2.5">
                <div className="flex items-center justify-center gap-1.5">
                  <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--color-border)]" />
                  <div className="h-5 w-16 rounded bg-[var(--color-border)]" />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr
              key={i}
              className={`border-b border-[var(--color-border)] last:border-b-0 ${i % 2 === 0 ? "bg-[var(--color-bg)]" : "bg-[var(--color-bg-secondary)]"}`}
            >
              <td className="px-4 py-2.5">
                <div className="h-5 w-24 rounded bg-[var(--color-border)]" />
              </td>
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="px-4 py-2.5">
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
