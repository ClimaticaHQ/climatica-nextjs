"use client";

import { ChipScroller } from "@/components/UI/ChipScroller";
import { Chip } from "@/components/UI";
import { ARRIVAL_FLASH_ATTRIBUTE, DEFAULT_BAR_STYLE } from "@/constants";
import { useArrivalFlash } from "@/hooks/ui/useArrivalFlash";
import { getEntityBarSwatch } from "@/utils";
import { toggleFilterOption } from "@/utils/filters.util";
import { useTranslations } from "next-intl";
import { SERIES_CHIP_FRAME_CLASS } from "./charts.constant";
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
  // * a year just added flashes where it landed in the order
  const arrivalRef = useArrivalFlash<HTMLDivElement>(entries.map(({ series }) => series.id));

  return (
    <div
      ref={arrivalRef}
      role="group"
      aria-label={t("chart.yearsShown")}
      className="flex min-w-0 flex-1 flex-col"
    >
      <ChipScroller contentKey={entries.map(({ series }) => series.id).join("|")}>
        {entries.map((entry) => {
          const { id, label, shape, hatch, markerSlot } = entry.series;
          const bars = getEntityBarSwatch(barStyle, hatch, markerSlot);
          return (
            <span
              key={id}
              {...{ [ARRIVAL_FLASH_ATTRIBUTE]: id }}
              className={SERIES_CHIP_FRAME_CLASS}
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
