"use client";

import { Button } from "@/components/UI/Button";
import { DotLabel } from "@/components/UI/DotLabel/DotLabel";
import { Dropdown } from "@/components/UI/Dropdown";
import { OptionDot } from "@/components/UI/Dropdown/OptionDot";
import { SwapButton } from "@/components/UI/SwapButton";
import {
  DATASETS,
  FILTER_WEATHER_PERIODS_LIMITS,
  LG_MEDIA_QUERY,
  WEATHER_MAX_YEAR,
  WEATHER_MIN_YEAR,
} from "@/constants";
import { EButtonVariant, EFilterApplyMode, EFilterKey, EFilterNoteVariant } from "@/enums";
import { useCityClimatePeriods } from "@/hooks/filters/useCityClimatePeriods";
import { useFilterNavigation } from "@/hooks/filters/useFilterNavigation";
import { useFilters } from "@/hooks/filters/useFilters";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";
import type { TClimatePeriod } from "@/constants";
import type { TFilterChangeHandler, TPair } from "@/types";
import {
  getAddedWeatherPeriodError,
  getClimatePeriodOptions,
  setFilterValue,
  toClimatePeriodHandler,
} from "@/utils/filters.util";
import { setPairSide, swapPair } from "@/utils/pair.util";
import { getYearColor } from "@/utils/yearColor.util";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { FilterNote, FilterSection } from "../FilterSection";
import { COMPARED_PERIODS_CLASSES as C, PERIOD_PAIR_SIDES } from "../filters.constant";
import type {
  TComparedPeriodsSectionProps,
  TPeriodPairProps,
  TYearsEditorProps,
} from "../filters.type";
import { YearInput } from "../YearInput";

/**
 * Compare Periods' own selectors on the page, below lg; every change applies at once. From lg
 * the sidebar has the same section, as part of its draft.
 */
export function ComparedPeriods() {
  const filters = useFilters();
  const { applyFilters, updateFilters } = useFilterNavigation();
  const availablePeriods = useCityClimatePeriods();
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY);
  if (isDesktop) return null;

  const handleChange: TFilterChangeHandler = (key, value) =>
    applyFilters(setFilterValue(filters, key, value), EFilterApplyMode.QUICK);

  return (
    <div className={C.PAGE}>
      <ComparedPeriodsSection
        values={filters}
        availablePeriods={availablePeriods}
        onChange={handleChange}
        onChangeMany={(values) => updateFilters(values, EFilterApplyMode.QUICK)}
        isOnPage
      />
    </div>
  );
}

/** The two climate periods, or — with Weather — the compared years. */
export function ComparedPeriodsSection({
  values,
  availablePeriods,
  onChange,
  onChangeMany,
  isOnPage = false,
}: TComparedPeriodsSectionProps) {
  return values.dataset === DATASETS.WEATHER ? (
    <YearsEditor
      value={values.weatherPeriods}
      onChange={(periods) => onChange(EFilterKey.WEATHER_PERIODS, periods)}
      isCompact={!isOnPage}
    />
  ) : (
    <PeriodPair
      periods={values}
      availablePeriods={availablePeriods}
      onChange={onChangeMany}
      isCompact={!isOnPage}
    />
  );
}

/** Period A, a swap button, Period B; a side never offers the other's period. */
function PeriodPair({ periods, availablePeriods, onChange, isCompact }: TPeriodPairProps) {
  const t = useTranslations();
  const labelId = useId();
  const pair: TPair<TClimatePeriod> = [periods.climatePeriodA, periods.climatePeriodB];
  const emit = ([climatePeriodA, climatePeriodB]: TPair<TClimatePeriod>) =>
    onChange({ climatePeriodA, climatePeriodB });

  const [sideA, sideB] = PERIOD_PAIR_SIDES.map(({ side, index, labelKey, color, testId }) => (
    <div key={side} className={C.SIDE}>
      <div id={`${labelId}-${side}`}>
        <DotLabel label={t(labelKey)} dotColor={color} />
      </div>
      <Dropdown
        options={getClimatePeriodOptions(availablePeriods, pair[index === 0 ? 1 : 0])}
        value={pair[index]}
        onChange={toClimatePeriodHandler((period) => emit(setPairSide(pair, side, period)))}
        ariaLabelledBy={`${labelId}-${side}`}
        accentColor={color}
        isStretched
        className="w-full"
        data-testid={`${testId}-select`}
        optionTestIdPrefix={`${testId}-option`}
      />
    </div>
  ));
  const row = (
    <div className={isCompact ? C.PAIR_COMPACT_ROW : C.PAIR_ROW}>
      {sideA}
      <SwapButton
        label={t("comparePeriods.swapPeriods")}
        onClick={() => emit(swapPair(pair))}
        {...(isCompact ? { className: C.PAIR_COMPACT_SWAP } : {})}
      />
      {sideB}
    </div>
  );

  return isCompact ? (
    <FilterSection title={t("sidebar.sections.climatePeriod")}>
      <div className={C.PAIR_COMPACT_FRAME}>{row}</div>
    </FilterSection>
  ) : (
    <div>{row}</div>
  );
}

/** The compared weather years, kept within FILTER_WEATHER_PERIODS_LIMITS. */
function YearsEditor({ value, onChange, isCompact }: TYearsEditorProps) {
  const t = useTranslations();
  const [year, setYear] = useState<number | undefined>(undefined);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const isFull = value.length >= FILTER_WEATHER_PERIODS_LIMITS.MAX;
  const canRemove = value.length > FILTER_WEATHER_PERIODS_LIMITS.MIN;

  function handleAdd() {
    if (isFull) return;
    const error = getAddedWeatherPeriodError(year, value);
    setErrorKey(error);
    if (error !== null || year === undefined) return;
    onChange([...value, year]);
    setYear(undefined);
  }

  return (
    <FilterSection title={t("sidebar.sections.yearRange")} className={C.EDITOR}>
      <div className={isCompact ? C.YEARS_COMPACT : undefined}>
        <div className={C.YEARS}>
          {value.map((period) => {
            const color = getYearColor(period, value);
            return (
              <span key={period} className={C.YEAR} style={{ borderColor: color }}>
                <OptionDot color={color} />
                <span style={{ color }}>{period}</span>
                {canRemove && (
                  <button
                    type="button"
                    onClick={() => onChange(value.filter((kept) => kept !== period))}
                    className={C.YEAR_REMOVE}
                    aria-label={t("comparePeriods.weather.removePeriod", { year: period })}
                  >
                    ×
                  </button>
                )}
              </span>
            );
          })}
        </div>
      </div>
      <div className={C.ADD_ROW}>
        <div className="flex-1">
          <YearInput
            value={year}
            min={WEATHER_MIN_YEAR}
            max={WEATHER_MAX_YEAR}
            onChange={(next) => {
              setYear(next);
              setErrorKey(null);
            }}
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
      <FilterNote
        text={t("comparePeriods.weather.periodsCount", {
          count: value.length,
          max: FILTER_WEATHER_PERIODS_LIMITS.MAX,
        })}
        variant={EFilterNoteVariant.INFO}
      />
      {errorKey !== null && (
        <FilterNote
          text={t(errorKey, { min: WEATHER_MIN_YEAR, max: WEATHER_MAX_YEAR })}
          variant={EFilterNoteVariant.ERROR}
        />
      )}
    </FilterSection>
  );
}
