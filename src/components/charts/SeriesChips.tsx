"use client";

import { ChipScroller } from "@/components/UI/ChipScroller";
import { Chip } from "@/components/UI";
import { DEFAULT_BAR_STYLE } from "@/constants";
import { getEntityBarSwatch } from "@/utils";
import { toggleFilterOption } from "@/utils/filters.util";
import { useTranslations } from "next-intl";
import type { TSeriesChipsProps } from "./charts.type";

/**
 * The overlay's series as chips — its entity legend: each with its bars as the bar style draws
 * them (hatch, shade or none) and its curves' shape (entries in list order):
 * tap toggles one; the last one shown stays on (locked, as the last variable
 * does). Hovering or focusing a chip highlights its series.
 */
export function SeriesChips({
  entries,
  barStyle = DEFAULT_BAR_STYLE,
  shown,
  onShownChange,
  onHighlight,
}: TSeriesChipsProps) {
  const t = useTranslations();
  const [lockedId] = shown.length === 1 ? shown : [];

  return (
    <div role="group" aria-label={t("chart.yearsShown")} className="flex min-w-0 flex-1 flex-col">
      <ChipScroller contentKey={entries.map(({ series }) => series.id).join("|")}>
        {entries.map((entry, place) => {
          const { id, label, shape, hatch } = entry.series;
          const bars = getEntityBarSwatch(barStyle, hatch, place);
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
                markerShape={shape}
                markerHatch={bars.hatch}
                markerFill={bars.fill}
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
