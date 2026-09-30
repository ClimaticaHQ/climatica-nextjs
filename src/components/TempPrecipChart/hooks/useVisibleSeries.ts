import type { TVisibleSeries } from "@/types";
import { useEffect, useState } from "react";
import { DEFAULT_VISIBLE_SERIES } from "../TempPrecipChart.constant";
import type { TUseVisibleSeriesArgs } from "../TempPrecipChart.type";
import { resolveVisibleSeries } from "../utils";

/** The variables the chart draws: follows the page's variable filter, toggled by the chips. */
export function useVisibleSeries({ variables, onVisibleSeriesChange }: TUseVisibleSeriesArgs) {
  const [visible, setVisible] = useState<TVisibleSeries>(() =>
    resolveVisibleSeries(variables, DEFAULT_VISIBLE_SERIES),
  );
  const [prevVariables, setPrevVariables] = useState(variables);

  /** Render-phase state update — intentional; avoids a stale-render flash from useEffect */
  if (variables !== prevVariables) {
    setPrevVariables(variables);
    setVisible((prev) => resolveVisibleSeries(variables, prev));
  }

  useEffect(() => {
    onVisibleSeriesChange?.(visible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return { visible, setVisible };
}
