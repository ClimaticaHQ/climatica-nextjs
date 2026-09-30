import { STAT_TEXT_CLASSES } from "../ClimateStatsBar.constant";
import type { TStatCellProps } from "../ClimateStatsBar.type";

/**
 * Three rows — label / value / meta (Martonne class, delta) — as a subgrid of the bar's rows,
 * so across a row of cards the labels share one height, the values sit on one line and the
 * badges and deltas on the next, even when a label wraps.
 */
export function StatCell({
  label,
  fullLabel,
  title,
  children,
  hasMetaRow,
  meta,
  cellClassName,
}: TStatCellProps) {
  return (
    <div
      className={`grid grid-rows-subgrid gap-y-0.5 py-2 @max-sm:last:odd:col-span-2 ${cellClassName} ${
        hasMetaRow ? "row-span-3" : "row-span-2"
      } ${title !== undefined ? "cursor-help" : ""}`}
      {...(title !== undefined ? { title } : {})}
    >
      <span className={`self-end ${STAT_TEXT_CLASSES.LABEL} text-[var(--color-text-secondary)]`}>
        {fullLabel !== undefined ? (
          <>
            <span aria-hidden>{label}</span>
            <span className="sr-only">{fullLabel}</span>
          </>
        ) : (
          label
        )}
      </span>
      <div className="min-w-0">{children}</div>
      {hasMetaRow && (
        <div
          className={`flex min-h-5 min-w-0 flex-wrap items-center gap-x-1.5 ${STAT_TEXT_CLASSES.META} tabular-nums text-[var(--color-text-secondary)]`}
        >
          {meta}
        </div>
      )}
    </div>
  );
}
