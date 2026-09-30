import { STAT_TEXT_CLASSES } from "../ClimateStatsBar.constant";
import type { TStatValueProps } from "../ClimateStatsBar.type";

export function StatValue({ value }: TStatValueProps) {
  return (
    <span
      className={`whitespace-nowrap ${STAT_TEXT_CLASSES.VALUE} font-medium tabular-nums text-[var(--color-text)]`}
    >
      {value}
    </span>
  );
}
