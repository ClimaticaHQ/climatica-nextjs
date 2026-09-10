import type { TSidebarSkeletonProps } from "./SidebarSkeleton.type";

function ChipsRow({ widths }: { widths: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {widths.map((w, i) => (
        <div key={i} className={`h-7 rounded-full bg-[var(--color-border)] ${w}`} />
      ))}
    </div>
  );
}

export function SidebarSkeleton({ isOpen }: TSidebarSkeletonProps) {
  return (
    <aside
      className={`
        flex w-64 shrink-0 flex-col overflow-hidden
        border-r border-[var(--color-border)] bg-[var(--color-bg)]
        fixed bottom-0 left-0 top-16 z-40 animate-pulse
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:static lg:top-auto lg:bottom-auto lg:z-auto lg:translate-x-0 lg:w-80
      `}
    >
      <div className="flex flex-1 flex-col overflow-y-auto p-4 gap-y-8">
        {/* Filters section — defaultOpen */}
        <div>
          <div className="mb-2 flex w-full items-center justify-between">
            <div className="h-4 w-16 rounded bg-[var(--color-border)]" />
            <div className="h-3 w-3 rounded-sm bg-[var(--color-border)]" />
          </div>

          <div className="flex flex-col gap-8">
            {/* Dataset */}
            <div>
              <div className="mb-2 h-3 w-16 rounded bg-[var(--color-border)]" />
              <ChipsRow widths={["w-16", "w-20"]} />
            </div>

            {/* Climate Period */}
            <div>
              <div className="mb-2 h-3 w-24 rounded bg-[var(--color-border)]" />
              <div className="h-9 w-full rounded-[var(--radius-sm)] bg-[var(--color-border)]" />
              <div className="mt-1.5 h-3 w-40 rounded bg-[var(--color-border)]" />
            </div>

            {/* Variables */}
            <div>
              <div className="mb-2 h-3 w-20 rounded bg-[var(--color-border)]" />
              <ChipsRow widths={["w-12", "w-12", "w-12", "w-14", "w-12", "w-14"]} />
              <div className="mt-1.5 h-3 w-48 rounded bg-[var(--color-border)]" />
            </div>

            {/* Grid resolution (CellSizeSelector) */}
            <div className="flex flex-col gap-1.5">
              <div className="mb-2 h-3 w-28 rounded bg-[var(--color-border)]" />
              <div className="h-9 w-full rounded-[var(--radius-sm)] bg-[var(--color-border)]" />
            </div>

            {/* Months */}
            <div>
              <div className="mb-2 h-3 w-16 rounded bg-[var(--color-border)]" />
              <ChipsRow widths={["w-10", ...Array.from({ length: 12 }).map(() => "w-9")]} />
            </div>
          </div>
        </div>

        {/* Settings section — collapsed by default, withDivider */}
        <div className="border-t border-[var(--color-border)] pt-2">
          <div className="mb-2 flex w-full items-center justify-between">
            <div className="h-4 w-20 rounded bg-[var(--color-border)]" />
            <div className="h-3 w-3 rounded-sm bg-[var(--color-border)]" />
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-[var(--color-border)] p-4">
        <div className="h-10 w-full rounded-[var(--radius-sm)] bg-[var(--color-border)]" />
      </div>
    </aside>
  );
}
