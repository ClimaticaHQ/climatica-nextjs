"use client";

import { SwapButton } from "@/components/UI/SwapButton";
import { EPairSide } from "@/enums";
import { setPairSide, swapPair } from "@/utils/pair.util";
import { useTranslations } from "next-intl";
import { Fragment } from "react";
import { YearPicker } from "../YearPicker";
import { YEAR_PAIR_VIEW_CLASSES as C } from "./YearPairView.constant";
import type { TYearPairViewProps } from "./YearPairView.type";

// * each side and its place in the pair
const SIDES = [
  [EPairSide.A, 0],
  [EPairSide.B, 1],
] as const;
const SIDE_LABEL_KEYS = {
  [EPairSide.A]: "climateComparison.periodA",
  [EPairSide.B]: "climateComparison.periodB",
} as const;

/**
 * Two compared years side by side, whatever each panel draws (Walter-Lieth or the standard
 * chart). With 3–5 years each panel picks its year — the other side's disabled — and a swap
 * sits between them, as Climate Period A / B do; with two, plain names.
 */
export function YearPairView({
  years,
  pair,
  onPairChange,
  renderPanel,
  legend,
}: TYearPairViewProps) {
  const t = useTranslations();
  const canPick = years.length > 2 && onPairChange !== undefined;

  const picker = (side: EPairSide, index: 0 | 1) =>
    canPick ? (
      <YearPicker
        label={t(SIDE_LABEL_KEYS[side])}
        value={pair[index]}
        otherYear={pair[index === 0 ? 1 : 0]}
        years={years}
        onChange={(year) => onPairChange(setPairSide(pair, side, year))}
        testIdPrefix={`year-${side}`}
      />
    ) : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className={canPick ? C.GRID_WITH_SWAP : C.GRID}>
        {SIDES.map(([side, index]) => (
          <Fragment key={side}>
            {index === 1 && canPick && (
              <div className={C.SWAP}>
                <SwapButton
                  label={t("comparePeriods.swapPeriods")}
                  onClick={() => onPairChange(swapPair(pair))}
                />
              </div>
            )}
            {renderPanel(pair[index], picker(side, index))}
          </Fragment>
        ))}
      </div>
      {legend}
    </div>
  );
}
