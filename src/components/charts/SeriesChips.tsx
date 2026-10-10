"use client";

import { ChipScroller } from "@/components/UI/ChipScroller";
import { Chip } from "@/components/UI";
import { toggleFilterOption } from "@/utils/filters.util";
import { useTranslations } from "next-intl";
import type { TSeriesChipsProps } from "./charts.type";
import { getIdentityColor } from "./charts.util";

/**
 * The overlay's series as colour chips: tap toggles one; the last one shown stays on (locked,
 * as the last variable does). Hovering or focusing a chip highlights its series.
 */
export function SeriesChips({
  entries,
  rule,
  shown,
  onShownChange,
  onHighlight,
}: TSeriesChipsProps) {
  const t = useTranslations();
  const [lockedId] = shown.length === 1 ? shown : [];

  return (
    <div role="group" aria-label={t("chart.yearsShown")} className="flex flex-col">
      <ChipScroller contentKey={entries.map(({ series }) => series.id).join("|")}>
        {entries.map((entry) => {
          const { id, label } = entry.series;
          return (
            <span
              key={id}
              className="shrink-0"
              onMouseEnter={() => onHighlight(id)}
              onMouseLeave={() => onHighlight(null)}
              onFocus={() => onHighlight(id)}
              onBlur={() => onHighlight(null)}
            >
              <Chip
                label={label}
                dotColor={getIdentityColor(entry, rule)}
                isActive={shown.includes(id)}
                isLocked={id === lockedId}
                onClick={() => onShownChange(toggleFilterOption(shown, id))}
              />
            </span>
          );
        })}
      </ChipScroller>
    </div>
  );
}
