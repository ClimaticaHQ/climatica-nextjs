"use client";

import { Card } from "@/components/Card";
import { MartonneBadge } from "@/components/MartonneBadge";
import { Badge } from "@/components/UI/Badge";
import { ScrollEdgeFades } from "@/components/ScrollEdgeFades";
import { COMPARISON_METRIC_LABEL_KEYS, PENDING_MARTONNE_CLASS } from "@/constants";
import { EBadgeSize, ECardPadding } from "@/enums";
import { useArrivalFlash } from "@/hooks/ui/useArrivalFlash";
import { useScrollEdges } from "@/hooks/ui/useScrollEdges";
import { TEXT_PLACEHOLDER_WIDTHS, TextPlaceholder } from "@/components/UI/TextPlaceholder";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import {
  STATS_TABLE_CLASSES as C,
  STATS_TABLE_METRIC_COL_WIDTH,
  STATS_TABLE_MIN_REM,
} from "./charts.constant";
import type { TStatsTableProps } from "./charts.type";
import { StatsTableHead } from "./StatsTableHead";

export function StatsTable({
  table,
  columns,
  martonneLabel,
  differenceMeaning,
  sort,
}: TStatsTableProps) {
  const t = useTranslations();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const ids = table.columns.map(({ id }) => id);
  const edges = useScrollEdges(scrollerRef, ids.join("|"));
  const arrivalRef = useArrivalFlash<HTMLTableElement>(ids);
  const { difference } = table;
  const labels = table.columns.map(({ label }) => label);
  const pending = <TextPlaceholder widthClass={TEXT_PLACEHOLDER_WIDTHS.STAT} />;
  const minWidth = `${STATS_TABLE_MIN_REM.METRIC + table.columns.length * STATS_TABLE_MIN_REM.VALUE}rem`;

  return (
    <Card padding={ECardPadding.NONE} flashKeys={ids} shouldClip>
      <div className={C.FRAME}>
        <div ref={scrollerRef} className={C.SCROLLER}>
          <table ref={arrivalRef} className={C.TABLE} style={{ minWidth }}>
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
            <StatsTableHead
              table={table}
              columns={columns}
              differenceMeaning={differenceMeaning}
              sort={sort}
            />
            <tbody>
              {table.rows.map((row) => (
                <tr key={row.metric} className={C.ROW}>
                  <th scope="row" className={C.METRIC_CELL}>
                    {row.metric === "martonne"
                      ? martonneLabel
                      : t(COMPARISON_METRIC_LABEL_KEYS[row.metric])}
                  </th>
                  {row.values.map((value, index) => (
                    <td key={ids[index]} className={C.VALUE_CELL}>
                      {value === null ? (
                        <span className={C.VALUE_LINE}>
                          {row.metric === "martonne" && (
                            <Badge
                              tone={PENDING_MARTONNE_CLASS.tone}
                              size={EBadgeSize.SM}
                              isPending
                            >
                              {t(PENDING_MARTONNE_CLASS.labelKey)}
                            </Badge>
                          )}
                          {pending}
                        </span>
                      ) : (
                        <span className={C.VALUE_LINE}>
                          {value.badge && <MartonneBadge badge={value.badge} />}
                          {value.text}
                        </span>
                      )}
                      {difference &&
                        index === row.values.length - 1 &&
                        (row.difference || value === null) && (
                          <span className={`${C.MUTED_LINE} ${C.DIFFERENCE_BELOW}`}>
                            {row.difference ?? pending}
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
