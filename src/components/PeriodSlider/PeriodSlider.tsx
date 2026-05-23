import { CLIMATE_RANGE } from "@/constants";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import type { TPeriodSliderProps } from "./PeriodSlider.type";

export default function PeriodSlider({ startYear, onChange }: TPeriodSliderProps) {
  const { t } = useTranslation();
  const sliderId = useId();
  const endYear = Math.min(startYear + CLIMATE_RANGE.WINDOW, CLIMATE_RANGE.MAX_START);

  const pctStart =
    ((startYear - CLIMATE_RANGE.MIN_START) / (CLIMATE_RANGE.MAX_START - CLIMATE_RANGE.MIN_START)) *
    100;

  const pctEnd =
    ((endYear - CLIMATE_RANGE.MIN_START) / (CLIMATE_RANGE.MAX_START - CLIMATE_RANGE.MIN_START)) *
    100;

  const ticks: number[] = [];

  for (let y = CLIMATE_RANGE.MIN_START; y <= CLIMATE_RANGE.MAX_START; y += 10) {
    ticks.push(y);
  }

  if (ticks[ticks.length - 1] !== CLIMATE_RANGE.MAX_START) {
    ticks.push(CLIMATE_RANGE.MAX_START);
  }

  return (
    <div className="w-full flex flex-col gap-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <label
          htmlFor={sliderId}
          className="text-[length:var(--font-sm)] font-semibold text-[var(--color-text-strong)]"
        >
          {t("filters.period")}
        </label>
        <span
          className="
            text-[length:var(--font-sm)] font-semibold
            text-[var(--color-primary)]
            bg-[var(--color-primary-subtle)]
            px-3 py-0.5 rounded-full
          "
        >
          {startYear} – {endYear}
        </span>
      </div>

      {/* Track */}
      <div className="relative h-5 flex items-center">
        {/* Background track */}
        <div
          className="
            absolute inset-x-0 h-[5px]
            bg-[var(--color-bg-secondary)]
            border border-[var(--color-border)]
            rounded-full
          "
        />
        {/* Filled range */}
        <div
          className="absolute h-[5px] bg-[var(--color-primary)] rounded-full pointer-events-none"
          style={{ left: `${pctStart}%`, width: `${pctEnd - pctStart}%` }}
        />
        {/* Native range input */}
        <input
          id={sliderId}
          type="range"
          min={CLIMATE_RANGE.MIN_START}
          max={CLIMATE_RANGE.MAX_START}
          step={1}
          value={startYear}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={t("filters.period")}
          aria-valuetext={`${startYear} – ${endYear}`}
          className="period-slider absolute inset-x-0 w-full h-5 appearance-none bg-transparent cursor-pointer"
        />
      </div>

      {/* Ticks */}
      <div className="relative h-6 mt-0.5">
        {ticks.map((tick) => {
          const pct =
            ((tick - CLIMATE_RANGE.MIN_START) /
              (CLIMATE_RANGE.MAX_START - CLIMATE_RANGE.MIN_START)) *
            100;
          return (
            <div
              key={tick}
              className="absolute -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${pct}%` }}
            >
              <div className="w-px h-1.5 bg-[var(--color-border)]" />
              <span className="mt-0.5 text-[10px] leading-none text-[var(--color-text-secondary)] whitespace-nowrap select-none">
                {tick}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
