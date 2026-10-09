"use client";

import { FilterChip } from "@/components/FilterChip";
import { toggleFilterOption } from "@/utils/filters.util";
import { useTranslations } from "next-intl";
import { ChipScroller } from "../ChipScroller";
import type { TYearChipsProps } from "./YearChips.type";

/**
 * The overlay's years as colour chips: tap toggles one; the last one shown stays on (locked:
 * not-allowed cursor, announced as disabled), as the last variable does. Hovering or focusing a chip highlights its year.
 */
export function YearChips({ years, shown, onShownChange, onHighlight }: TYearChipsProps) {
  const t = useTranslations();
  const [lockedYear] = shown.length === 1 ? shown : [];

  return (
    <div role="group" aria-label={t("chart.yearsShown")} className="flex flex-col">
      <ChipScroller contentKey={years.map(({ year }) => year).join("|")}>
        {years.map(({ year, color }) => {
          const isLocked = year === lockedYear;
          return (
            <span
              key={year}
              className="shrink-0"
              onMouseEnter={() => onHighlight(year)}
              onMouseLeave={() => onHighlight(null)}
              onFocus={() => onHighlight(year)}
              onBlur={() => onHighlight(null)}
            >
              <FilterChip
                label={String(year)}
                dotColor={color}
                isActive={shown.includes(year)}
                isLocked={isLocked}
                onClick={() => onShownChange(toggleFilterOption(shown, year))}
              />
            </span>
          );
        })}
      </ChipScroller>
    </div>
  );
}
