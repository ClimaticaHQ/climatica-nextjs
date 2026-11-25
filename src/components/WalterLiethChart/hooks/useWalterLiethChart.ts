import { buildWalterLiethRows, getAridHumidSegments, getFrostMonths } from "@/utils";
import { useId, useMemo } from "react";
import type { TUseWalterLiethChartArgs } from "../WalterLiethChart.type";

export function useWalterLiethChart({ series, monthOrder }: TUseWalterLiethChartArgs) {
  const id = useId();

  const rows = useMemo(
    () => buildWalterLiethRows(series.months, monthOrder),
    [series.months, monthOrder],
  );
  const segments = useMemo(
    () => getAridHumidSegments({ months: series.months, monthOrder }),
    [series.months, monthOrder],
  );
  const frost = useMemo(() => getFrostMonths(series.months), [series.months]);

  return {
    rows,
    segments,
    frost,
    // * per-instance ids: two diagrams on one page must not share pattern definitions
    patternIds: { humid: `${id}-humid`, arid: `${id}-arid` },
  };
}
