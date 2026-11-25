import type { TVisibleSeries } from "@/types";
import { useEffect, useState } from "react";
import { DEFAULT_VISIBLE_SERIES, FILTER_LIST_SEPARATOR } from "@/constants";
import type { TUseVisibleSeriesArgs } from "@/components/charts/charts.type";
import { resolveVisibleSeries } from "@/utils/visibleSeries.util";

export function useVisibleSeries({ variables, onVisibleSeriesChange }: TUseVisibleSeriesArgs) {
  const [visible, setVisible] = useState<TVisibleSeries>(() =>
    resolveVisibleSeries(variables, DEFAULT_VISIBLE_SERIES),
  );
  // * compared by value: the filters are re-parsed on every URL change, so the array is new each time
  const variablesKey = variables?.join(FILTER_LIST_SEPARATOR);
  const [prevVariablesKey, setPrevVariablesKey] = useState(variablesKey);

  /** Render-phase state update — intentional; avoids a stale-render flash from useEffect */
  if (variablesKey !== prevVariablesKey) {
    setPrevVariablesKey(variablesKey);
    setVisible((prev) => resolveVisibleSeries(variables, prev));
  }

  useEffect(() => {
    onVisibleSeriesChange?.(visible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return { visible, setVisible };
}
