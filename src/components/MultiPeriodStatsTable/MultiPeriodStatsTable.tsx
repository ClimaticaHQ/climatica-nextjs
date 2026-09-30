import { Card } from "@/components/Card";
import { ECardPadding } from "@/enums";
import { DATA_UPDATE_ALL_SERIES, MISSING_VALUE_LABEL, VALUE_DIGITS } from "@/constants";
import { useFormatNumber } from "@/hooks";
import type { TCompareStats } from "@/types";
import { computeCompareStats } from "@/utils/climateComparison.util";
import { getMartonneLabelKey } from "@/utils/martonne.util";
import { useTranslations } from "next-intl";
import type { TMultiPeriodStatsTableProps, TUnitValueKey } from "./MultiPeriodStatsTable.type";

const LABEL_COL_WIDTH = 180;

function SkeletonCell() {
  return <div className="animate-pulse rounded bg-[var(--color-border)] h-4 w-16 mx-auto" />;
}

export function MultiPeriodStatsTable({
  periods,
  periodsData,
  loadingPeriods,
  altitude,
  periodColors,
}: TMultiPeriodStatsTableProps) {
  const t = useTranslations();
  const formatNumber = useFormatNumber();
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

  function color(i: number): string {
    return periodColors[i] ?? `var(--color-period-${i})`;
  }

  const totalRows = metrics.length + (altitude !== null ? 1 : 0);
  const dataColWidth = n > 0 ? `calc((100% - ${LABEL_COL_WIDTH}px) / ${n})` : "auto";

  return (
    <Card padding={ECardPadding.NONE} flashKeys={DATA_UPDATE_ALL_SERIES} shouldClip>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-[length:var(--font-sm)]">
          <colgroup>
            <col style={{ width: `${LABEL_COL_WIDTH}px` }} />
            {periods.map((year) => (
              <col key={year} className="table-column-resize" style={{ width: dataColWidth }} />
            ))}
          </colgroup>

          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
              <th className="h-11 px-4 py-2.5 text-left font-medium text-[var(--color-text-secondary)]" />
              {periods.map((year, i) => (
                <th
                  key={year}
                  className="h-11 px-4 py-2.5 text-center font-semibold"
                  style={{ color: color(i) }}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: color(i) }}
                    />
                    <span style={{ color: color(i) }}>{year}</span>
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
                <td className="h-11 px-4 py-2.5 text-[var(--color-text-secondary)]">{row.label}</td>
                {periods.map((year, j) => {
                  if (loadingPeriods.includes(year)) {
                    return (
                      <td key={year} className="h-11 px-4 py-2.5">
                        <SkeletonCell />
                      </td>
                    );
                  }
                  const stats = statsMap.get(year);
                  return (
                    <td
                      key={year}
                      className="h-11 px-4 py-2.5 text-center font-semibold"
                      style={{ color: color(j) }}
                    >
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
                <td className="h-11 px-4 py-2.5 text-[var(--color-text-secondary)]">
                  {t("chart.altitude")}
                </td>
                {periods.map((year, j) => {
                  if (loadingPeriods.includes(year)) {
                    return (
                      <td key={year} className="h-11 px-4 py-2.5">
                        <SkeletonCell />
                      </td>
                    );
                  }
                  return (
                    <td
                      key={year}
                      className="h-11 px-4 py-2.5 text-center font-semibold"
                      style={{ color: color(j) }}
                    >
                      {withUnit(altitude, "units.metersValue")}
                    </td>
                  );
                })}
              </tr>
            )}

            <tr
              className={`${totalRows % 2 === 0 ? "bg-[var(--color-bg)]" : "bg-[var(--color-bg-secondary)]"}`}
            >
              <td className="h-11 px-4 py-2.5 text-[var(--color-text-secondary)]">
                {t("chart.martonne")}
              </td>
              {periods.map((year, j) => {
                if (loadingPeriods.includes(year)) {
                  return (
                    <td key={year} className="h-11 px-4 py-2.5">
                      <SkeletonCell />
                    </td>
                  );
                }
                const stats = statsMap.get(year);
                return (
                  <td
                    key={year}
                    className="h-11 px-4 py-2.5 text-center font-semibold"
                    style={{ color: color(j) }}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {formatNumber(stats?.martonneIndex, { digits: VALUE_DIGITS.MARTONNE })}
                      {stats !== undefined && stats.martonneIndex !== null && (
                        <span
                          className="text-[10px] font-medium"
                          style={{ padding: "2px 6px", borderRadius: 8 }}
                        >
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
    </Card>
  );
}
