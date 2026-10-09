"use client";

import { Button } from "@/components/UI/Button";
import { YearInput } from "@/components/YearInput";
import { FILTER_WEATHER_PERIODS_LIMITS, WEATHER_MAX_YEAR, WEATHER_MIN_YEAR } from "@/constants";
import { EButtonVariant, EFilterHintVariant } from "@/enums";
import { getAddedWeatherPeriodError } from "@/utils/filters.util";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FilterHint } from "../FilterHint";
import { FilterSection } from "../FilterSection";
import { WeatherPeriodList } from "../WeatherPeriodList";
import { WEATHER_PERIODS_EDITOR_CLASSES as C } from "./WeatherPeriodsEditor.constant";
import type { TWeatherPeriodsEditorProps } from "./WeatherPeriodsEditor.type";

/**
 * Compare Periods' weather years — kept within FILTER_WEATHER_PERIODS_LIMITS. On the page below
 * lg, and as a sidebar section from lg (compact); the caller decides when a change applies.
 */
export function WeatherPeriodsEditor({
  value,
  onChange,
  isCompact = false,
}: TWeatherPeriodsEditorProps) {
  const t = useTranslations();
  const [year, setYear] = useState<number | undefined>(undefined);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const isFull = value.length >= FILTER_WEATHER_PERIODS_LIMITS.MAX;
  const canRemove = value.length > FILTER_WEATHER_PERIODS_LIMITS.MIN;

  function handleYearChange(next: number) {
    setYear(next);
    setErrorKey(null);
  }

  function handleAdd() {
    if (isFull) return;
    const error = getAddedWeatherPeriodError(year, value);
    setErrorKey(error);
    if (error !== null || year === undefined) return;
    onChange([...value, year]);
    setYear(undefined);
  }

  function handleRemove(removed: number) {
    if (canRemove) onChange(value.filter((period) => period !== removed));
  }

  return (
    <FilterSection title={t("sidebar.sections.yearRange")} className={C.ROOT}>
      <div className={isCompact ? C.LIST_COMPACT : undefined}>
        <WeatherPeriodList years={value} canRemove={canRemove} onRemove={handleRemove} />
      </div>
      <div className={C.ADD_ROW}>
        <div className="flex-1">
          <YearInput
            value={year}
            min={WEATHER_MIN_YEAR}
            max={WEATHER_MAX_YEAR}
            onChange={handleYearChange}
            onEnter={handleAdd}
            placeholder={`${WEATHER_MIN_YEAR}–${WEATHER_MAX_YEAR}`}
            disabled={isFull}
          />
        </div>
        <Button
          variant={EButtonVariant.SECONDARY}
          onClick={handleAdd}
          disabled={isFull}
          className={isCompact ? C.ADD_BUTTON_COMPACT : C.ADD_BUTTON}
        >
          {t("comparePeriods.weather.addPeriod")}
        </Button>
      </div>
      <FilterHint
        text={t("comparePeriods.weather.periodsCount", {
          count: value.length,
          max: FILTER_WEATHER_PERIODS_LIMITS.MAX,
        })}
        variant={EFilterHintVariant.INFO}
      />
      {errorKey !== null && (
        <FilterHint
          text={t(errorKey, { min: WEATHER_MIN_YEAR, max: WEATHER_MAX_YEAR })}
          variant={EFilterHintVariant.ERROR}
        />
      )}
    </FilterSection>
  );
}
