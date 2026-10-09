"use client";

import { CLIMATE_COMPARISON_COLORS, type TClimatePeriod } from "@/constants";
import { EPairSide } from "@/enums";
import type { TPair } from "@/types";
import { setPairSide, swapPair } from "@/utils/pair.util";
import { useTranslations } from "next-intl";
import { PeriodSelector } from "../PeriodSelector";
import { SwapPeriodsButton } from "../SwapPeriodsButton";
import { PERIOD_PAIR_SELECTOR_CLASSES as C } from "./PeriodPairSelector.constant";
import type { TPeriodPairSelectorProps } from "./PeriodPairSelector.type";

/**
 * Period A, a swap button, Period B — in one row (stacked in a narrow sidebar); a side never
 * offers the other's period.
 */
export function PeriodPairSelector({
  periods,
  availablePeriods,
  onChange,
  isCompact = false,
}: TPeriodPairSelectorProps) {
  const t = useTranslations();
  const { climatePeriodA, climatePeriodB } = periods;
  const pair: TPair<TClimatePeriod> = [climatePeriodA, climatePeriodB];
  const emit = ([a, b]: TPair<TClimatePeriod>) =>
    onChange({ climatePeriodA: a, climatePeriodB: b });

  return (
    <div className={isCompact ? C.COMPACT_FRAME : undefined}>
      <div className={isCompact ? C.COMPACT_ROW : C.ROW}>
        <PeriodSelector
          label={t("climateComparison.periodA")}
          accentColor={CLIMATE_COMPARISON_COLORS.A.tmax}
          value={climatePeriodA}
          availablePeriods={availablePeriods}
          otherPeriod={climatePeriodB}
          onChange={(period) => emit(setPairSide(pair, EPairSide.A, period))}
          testIdPrefix="period-a"
        />
        <SwapPeriodsButton
          onClick={() => emit(swapPair(pair))}
          {...(isCompact ? { className: C.COMPACT_SWAP } : {})}
        />
        <PeriodSelector
          label={t("climateComparison.periodB")}
          accentColor={CLIMATE_COMPARISON_COLORS.B.tmax}
          value={climatePeriodB}
          availablePeriods={availablePeriods}
          otherPeriod={climatePeriodA}
          onChange={(period) => emit(setPairSide(pair, EPairSide.B, period))}
          testIdPrefix="period-b"
        />
      </div>
    </div>
  );
}
