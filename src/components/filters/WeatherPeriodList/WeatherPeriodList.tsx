"use client";

import { OptionDot } from "@/components/UI/Dropdown/OptionDot";
import { getYearColor } from "@/utils/yearColor.util";
import { useTranslations } from "next-intl";
import type { TWeatherPeriodListProps } from "./WeatherPeriodList.type";

/** The compared years, each in its series color, removable while above the minimum. */
export function WeatherPeriodList({ years, canRemove, onRemove }: TWeatherPeriodListProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-wrap gap-2">
      {years.map((year) => {
        const color = getYearColor(year, years);
        return (
          <span
            key={year}
            // * a full border in the year's colour — a left-only border on a pill reads as a
            // * cut-off arc
            className="inline-flex items-center gap-1.5 rounded-[20px] border bg-[var(--color-bg-secondary)] px-3 py-1.5 text-[13px] font-medium text-[var(--color-text)]"
            style={{ borderColor: color }}
          >
            <OptionDot color={color} />
            <span style={{ color }}>{year}</span>
            {canRemove && (
              <button
                type="button"
                onClick={() => onRemove(year)}
                className="ml-0.5 opacity-60 hover:opacity-100 leading-none text-[var(--color-text-secondary)]"
                aria-label={t("comparePeriods.weather.removePeriod", { year })}
              >
                ×
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}
