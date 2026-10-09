"use client";

import { Card } from "@/components/Card";
import { ScrollEdgeFades } from "@/components/ScrollEdgeFades";
import { useScrollEdges } from "@/hooks/ui/useScrollEdges";
import { ECardPadding } from "@/enums";
import { DATA_UPDATE_ALL_SERIES, MISSING_VALUE_LABEL, VALUE_DIGITS } from "@/constants";
import { useFormatNumber } from "@/hooks";
import type { TCompareStats } from "@/types";
import { computeCompareStats } from "@/utils/climateComparison.util";
import { getMartonneLabelKey } from "@/utils/martonne.util";
import { getYearColor } from "@/utils/yearColor.util";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import {
  DATA_COL_MIN_REM,
  LABEL_COL_MIN_REM,
  LABEL_COL_VAR,
  MULTI_PERIOD_STATS_CLASSES as C,
} from "./MultiPeriodStatsTable.constant";
import type { TMultiPeriodStatsTableProps, TUnitValueKey } from "./MultiPeriodStatsTable.type";

function SkeletonCell() {
  return <div className="animate-pulse rounded bg-[var(--color-border)] h-4 w-16 mx-auto" />;
}

export function MultiPeriodStatsTable({
  periods,
  periodsData,
  loadingPeriods,
  altitude,
}: TMultiPeriodStatsTableProps) {
  const t = useTranslations();
  const formatNumber = useFormatNumber();
  // * 4–5 years on a phone scroll sideways: an end fades while columns hide past it
  const scrollerRef = useRef<HTMLDivElement>(null);
  const edges = useScrollEdges(scrollerRef, periods.join("|"));
  // * a value with its unit in the locale ("12,3°C"), or "—" when unknown
  const withUnit = (value: number | null, unitKey: TUnitValueKey, digits = 0) =>
    value === null ? MISSING_VALUE_LABEL : t(unitKey, { value: formatNumber(value, { digits }) });

  const n = periods.length;
  const statsMap = new Map(periodsData.map(({ year, rows }) => [year, computeCompareStats(rows)]));

  const metrics: { label: string; format: (s: TCompareStats) => string }[] = [
    {
      label: t("climateComparison.stats.avgTmax"),
      format: (s) => withUnit(s.avgTmax, "units.celsiusValue", VALUE_DIGITS.TEMP),
    },
    {
      label: t("climateComparison.stats.avgTmin"),
      format: (s) => withUnit(s.avgTmin, "units.celsiusValue", VALUE_DIGITS.TEMP),
    },
    {
      label: t("climateComparison.stats.totalPrec"),
      format: (s) => withUnit(s.totalPrec, "units.mmValue"),
    },
    { label: t("climateComparison.stats.aridMonths"), format: (s) => formatNumber(s.aridMonths) },
  ];

  // * the year's colour from its place in the full list — the chart, chips and export agree
  const color = (year: number) => getYearColor(year, periods);

  const totalRows = metrics.length + (altitude !== null ? 1 : 0);
  const dataColWidth = n > 0 ? `calc((100% - ${LABEL_COL_VAR}) / ${n})` : "auto";
  const minTableWidth = `${LABEL_COL_MIN_REM + n * DATA_COL_MIN_REM}rem`;

  return (
    <Card padding={ECardPadding.NONE} flashKeys={DATA_UPDATE_ALL_SERIES} shouldClip>
      <div className={C.FRAME}>
        <div ref={scrollerRef} className={C.SCROLLER}>
          <table className={C.TABLE} style={{ minWidth: minTableWidth }}>
            <colgroup>
              <col style={{ width: LABEL_COL_VAR }} />
              {periods.map((year) => (
                <col key={year} className="table-column-resize" style={{ width: dataColWidth }} />
              ))}
            </colgroup>

            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                <th className={C.HEAD_LABEL} />
                {periods.map((year) => (
                  <th key={year} className={C.HEAD_CELL} style={{ color: color(year) }}>
                    <span className="flex items-center justify-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: color(year) }}
                      />
                      <span style={{ color: color(year) }}>{year}</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {metrics.map((row, i) => (
                <tr
                  key={row.label}
                  className={`border-b border-[var(--color-border)] ${i % 2 === 0 ? "bg-[var(--color-bg)]" : "bg-[var(--color-bg-secondary)]"}`}
                >
                  <td className={C.LABEL_CELL}>{row.label}</td>
                  {periods.map((year) => {
                    if (loadingPeriods.includes(year)) {
                      return (
                        <td key={year} className={C.SKELETON_CELL}>
                          <SkeletonCell />
                        </td>
                      );
                    }
                    const stats = statsMap.get(year);
                    return (
                      <td key={year} className={C.VALUE_CELL} style={{ color: color(year) }}>
                        {stats !== undefined ? row.format(stats) : MISSING_VALUE_LABEL}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {altitude !== null && (
                <tr
                  className={`border-b border-[var(--color-border)] ${metrics.length % 2 === 0 ? "bg-[var(--color-bg)]" : "bg-[var(--color-bg-secondary)]"}`}
                >
                  <td className={C.LABEL_CELL}>{t("chart.altitude")}</td>
                  {periods.map((year) => {
                    if (loadingPeriods.includes(year)) {
                      return (
                        <td key={year} className={C.SKELETON_CELL}>
                          <SkeletonCell />
                        </td>
                      );
                    }
                    return (
                      <td key={year} className={C.VALUE_CELL} style={{ color: color(year) }}>
                        {withUnit(altitude, "units.metersValue")}
                      </td>
                    );
                  })}
                </tr>
              )}

              <tr
                className={`${totalRows % 2 === 0 ? "bg-[var(--color-bg)]" : "bg-[var(--color-bg-secondary)]"}`}
              >
                <td className={C.LABEL_CELL}>{t("chart.martonnePerYear")}</td>
                {periods.map((year) => {
                  if (loadingPeriods.includes(year)) {
                    return (
                      <td key={year} className={C.SKELETON_CELL}>
                        <SkeletonCell />
                      </td>
                    );
                  }
                  const stats = statsMap.get(year);
                  return (
                    <td key={year} className={C.VALUE_CELL} style={{ color: color(year) }}>
                      <span className={C.MARTONNE}>
                        {formatNumber(stats?.martonneIndex, { digits: VALUE_DIGITS.MARTONNE })}
                        {stats !== undefined && stats.martonneIndex !== null && (
                          <span className={C.MARTONNE_CLASS}>
                            {t(getMartonneLabelKey(stats.martonneIndex))}
                          </span>
                        )}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
        {/* * the start fade begins past the pinned labels */}
        <ScrollEdgeFades {...edges} startInset={LABEL_COL_VAR} />
      </div>
    </Card>
  );
}
