"use client";

import { Dropdown } from "@/components/UI/Dropdown";
import { DATASETS, WEATHER_MAX_YEAR, WEATHER_MIN_YEAR } from "@/constants";
import { EFilterKey, EFilterNoteVariant } from "@/enums";
import { getClimatePeriodOptions, toClimatePeriodHandler } from "@/utils/filters.util";
import { useTranslations } from "next-intl";
import { FilterNote, FilterSection } from "../FilterSection";
import type { TFilterSectionRenderProps } from "../filters.type";
import { YearInput } from "../YearInput";

/** A climate normals period (dropdown) or a weather year (typed in), by dataset. */
export function PeriodFilter({
  values,
  availablePeriods,
  weatherYearError,
  onChange,
}: TFilterSectionRenderProps) {
  const t = useTranslations();

  if (values.dataset === DATASETS.CLIMATE) {
    return (
      <FilterSection title={t("sidebar.sections.climatePeriod")}>
        <Dropdown
          options={getClimatePeriodOptions(availablePeriods)}
          value={values.climatePeriod}
          onChange={toClimatePeriodHandler((period) => onChange(EFilterKey.CLIMATE_PERIOD, period))}
          className="w-full"
        />
        <FilterNote
          text={t("sidebar.notes.climateNormals")}
          variant={EFilterNoteVariant.INFO}
          className="mt-1.5"
        />
      </FilterSection>
    );
  }

  return (
    <FilterSection title={t("sidebar.sections.yearRange")} className="flex flex-col gap-2">
      <YearInput
        value={values.weatherYear}
        min={WEATHER_MIN_YEAR}
        max={WEATHER_MAX_YEAR}
        onChange={(year) => onChange(EFilterKey.WEATHER_YEAR, year)}
        placeholder={`${WEATHER_MIN_YEAR}–${WEATHER_MAX_YEAR}`}
      />
      {weatherYearError !== null && (
        <FilterNote
          text={t(weatherYearError, { min: WEATHER_MIN_YEAR, max: WEATHER_MAX_YEAR })}
          variant={EFilterNoteVariant.ERROR}
          className="font-medium"
        />
      )}
      <FilterNote text={t("sidebar.notes.weatherData")} variant={EFilterNoteVariant.INFO} />
    </FilterSection>
  );
}
