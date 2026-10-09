"use client";

import { YearInput } from "@/components/YearInput";
import { Dropdown } from "@/components/UI/Dropdown";
import { DATASETS, WEATHER_MAX_YEAR, WEATHER_MIN_YEAR } from "@/constants";
import { EFilterHintVariant } from "@/enums";
import { getClimatePeriodOptions, toClimatePeriodHandler } from "@/utils/filters.util";
import { useTranslations } from "next-intl";
import { FilterHint } from "../FilterHint";
import { FilterSection } from "../FilterSection";
import type { TPeriodFilterProps } from "./PeriodFilter.type";

export function PeriodFilter(props: TPeriodFilterProps) {
  const t = useTranslations();

  if (props.dataset === DATASETS.CLIMATE) {
    const { value, availablePeriods, onChange } = props;
    return (
      <FilterSection title={t("sidebar.sections.climatePeriod")}>
        <Dropdown
          options={getClimatePeriodOptions(availablePeriods)}
          value={value}
          onChange={toClimatePeriodHandler(onChange)}
          className="w-full"
        />
        <FilterHint
          text={t("sidebar.notes.climateNormals")}
          variant={EFilterHintVariant.INFO}
          className="mt-1.5"
        />
      </FilterSection>
    );
  }

  const { value, error, onChange } = props;
  return (
    <FilterSection title={t("sidebar.sections.yearRange")} className="flex flex-col gap-2">
      <YearInput
        value={value}
        min={WEATHER_MIN_YEAR}
        max={WEATHER_MAX_YEAR}
        onChange={onChange}
        placeholder={`${WEATHER_MIN_YEAR}–${WEATHER_MAX_YEAR}`}
      />
      {error !== null && (
        <FilterHint
          text={t(error, { min: WEATHER_MIN_YEAR, max: WEATHER_MAX_YEAR })}
          variant={EFilterHintVariant.ERROR}
          className="font-medium"
        />
      )}
      <FilterHint text={t("sidebar.notes.weatherData")} variant={EFilterHintVariant.INFO} />
    </FilterSection>
  );
}
