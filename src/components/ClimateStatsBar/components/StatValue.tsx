import { STAT_TEXT_CLASSES } from "../ClimateStatsBar.constant";
import type { TStatValueProps } from "../ClimateStatsBar.type";

export function StatValue({ a, b, aColor, bColor }: TStatValueProps) {
  return (
    <span
      className={`flex flex-wrap items-center gap-x-0.5 ${STAT_TEXT_CLASSES.VALUE} font-medium tabular-nums`}
    >
      <span className="whitespace-nowrap" style={{ color: aColor }}>
        {a}
      </span>
      {b !== undefined && (
        <>
          <span style={{ color: "var(--color-border)" }}>/</span>
          <span className="whitespace-nowrap" style={{ color: bColor }}>
            {b}
          </span>
        </>
      )}
    </span>
  );
}
