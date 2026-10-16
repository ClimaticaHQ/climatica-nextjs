"use client";

import { Card } from "@/components/Card";
import { MartonneBadge } from "@/components/MartonneBadge";
import { ScrollEdgeFades } from "@/components/ScrollEdgeFades";
import { COMPARISON_METRIC_LABEL_KEYS } from "@/constants";
import { ECardPadding } from "@/enums";
import { useScrollEdges } from "@/hooks/ui/useScrollEdges";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import {
  STATS_TABLE_CLASSES as C,
  STATS_TABLE_METRIC_COL_WIDTH,
  STATS_TABLE_MIN_REM,
} from "./charts.constant";
import type { TStatsTableProps } from "./charts.type";
import { StatsTableHead } from "./StatsTableHead";

/**
 * Every series side by side, metric by metric, in its colour — and a pair's difference (its
 * formula in the header's popover; below `sm` a line under the second value). A loading series' cells
 * wait; more series than fit scroll sideways, the metrics pinned. Flashes when a series updates.
 */
export function StatsTable({ table, columns, martonneLabel, differenceMeaning }: TStatsTableProps) {
  const t = useTranslations();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const ids = table.columns.map(({ id }) => id);
  const edges = useScrollEdges(scrollerRef, ids.join("|"));
  const { difference } = table;
  const labels = table.columns.map(({ label }) => label);
  const minWidth = `${STATS_TABLE_MIN_REM.METRIC + table.columns.length * STATS_TABLE_MIN_REM.VALUE}rem`;

  return (
    <Card padding={ECardPadding.NONE} flashKeys={ids} shouldClip>
      <div className={C.FRAME}>
        <div ref={scrollerRef} className={C.SCROLLER}>
          <table className={C.TABLE} style={{ minWidth }}>
            <caption className={C.CAPTION}>
              {difference
                ? t("climateComparison.tableCaption", { a: labels[0], b: labels[1] })
                : t("climateComparison.statsCaption", { names: labels.join(", ") })}
            </caption>
            <colgroup>
              <col className={C.METRIC_COL} />
              {ids.map((id) => (
                <col key={id} />
              ))}
              {difference && <col className={C.DIFFERENCE} />}
            </colgroup>
            <StatsTableHead table={table} columns={columns} differenceMeaning={differenceMeaning} />
            <tbody>
              {table.rows.map((row) => (
                <tr key={row.metric} className={C.ROW}>
                  <th scope="row" className={C.METRIC_CELL}>
                    {row.metric === "martonne"
                      ? martonneLabel
                      : t(COMPARISON_METRIC_LABEL_KEYS[row.metric])}
                  </th>
                  {row.values.map((value, index) => (
                    <td
                      key={ids[index]}
                      className={C.VALUE_CELL}
                      style={{ color: columns[index]?.color }}
                    >
                      {value === null ? (
                        <div className={C.LOADING_VALUE} />
                      ) : (
                        <span className={C.VALUE_LINE}>
                          {value.badge && <MartonneBadge badge={value.badge} />}
                          {value.text}
                        </span>
                      )}
                      {/* * below `sm` the difference's column is hidden: the last value carries it */}
                      {difference && index === row.values.length - 1 && row.difference && (
                        <span className={`${C.MUTED_LINE} ${C.DIFFERENCE_BELOW}`}>
                          {row.difference}
                        </span>
                      )}
                    </td>
                  ))}
                  {difference && <td className={C.DIFFERENCE_CELL}>{row.difference}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ScrollEdgeFades {...edges} startInset={STATS_TABLE_METRIC_COL_WIDTH} />
      </div>
    </Card>
  );
}
