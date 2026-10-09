"use client";

import { YearOverlay } from "@/components/CompareYears/YearOverlay";
import { ECompareLayout } from "@/enums";
import { resolveYearPair } from "@/utils/pair.util";
import { VariableChips } from "../VariableChips";
import { YearOverlayBody } from "./components/YearOverlayBody";
import { YearPairBody } from "./components/YearPairBody";
import type { TYearsBodyProps } from "./YearsBody.type";
import { toYearOptions } from "./YearsBody.util";

/**
 * Compare Periods with weather years, either chart mode: side by side draws the chosen pair,
 * overlay draws the shown years under their chips.
 */
export function YearsBody(props: TYearsBodyProps) {
  const { chart, chartProps, seriesYears, layout } = props;
  const years = toYearOptions(seriesYears);
  const context = {
    ...props,
    years,
    activeMonth: {
      activeMonthIndex: chart.activeMonthIndex,
      onActiveMonthIndexChange: chart.setActiveMonthIndex,
    },
  };
  const yearsState = chartProps.years;

  if (layout === ECompareLayout.OVERLAY && yearsState !== undefined) {
    return (
      <YearOverlay
        years={years}
        shown={yearsState.shown}
        onShownChange={yearsState.onShownChange}
        controls={
          props.isWalterLieth ? undefined : (
            <VariableChips
              visible={props.visible}
              variables={chartProps.variables}
              onChange={props.onVisibleChange}
              isScrollRow
            />
          )
        }
        renderDiagram={(highlighted) => (
          <YearOverlayBody context={context} shown={yearsState.shown} highlighted={highlighted} />
        )}
      />
    );
  }

  const pair = resolveYearPair(
    years.map(({ year }) => year),
    yearsState?.pair ?? null,
  );
  return pair === null ? null : <YearPairBody context={context} pair={pair} />;
}
