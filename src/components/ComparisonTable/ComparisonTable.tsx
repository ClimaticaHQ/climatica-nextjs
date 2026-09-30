import { Card } from "@/components/Card";
import { DIFFERENCE_DIRECTION_SEPARATOR } from "@/constants";
import { ECardPadding } from "@/enums";
import { useTranslations } from "next-intl";
import { COMPARISON_TABLE_CLASSES as C } from "./ComparisonTable.constant";
import type { TComparisonTableProps } from "./ComparisonTable.type";
import { ComparisonTableRow, SeriesHeader } from "./components";

/**
 * Both compared series side by side, metric by metric, with their difference (the direction
 * under its header). Below `sm` the difference moves under B's value. Flashes when either
 * series' data updates.
 */
export function ComparisonTable({ table }: TComparisonTableProps) {
  const t = useTranslations();

  return (
    <Card padding={ECardPadding.NONE} flashKeys={[table.seriesA.id, table.seriesB.id]} shouldClip>
      <table className={C.TABLE}>
        <caption className={C.CAPTION}>
          {t("climateComparison.tableCaption", {
            a: table.seriesA.label,
            b: table.seriesB.label,
          })}
        </caption>
        <colgroup>
          <col className={C.METRIC_COL} />
          <col />
          <col />
          <col className={C.DIFFERENCE} />
        </colgroup>
        <thead>
          <tr className={C.HEAD_ROW}>
            <th scope="col" className={C.METRIC_HEAD}>
              <span className={C.CAPTION}>{t("climateComparison.metric")}</span>
            </th>
            <SeriesHeader series={table.seriesA} />
            <SeriesHeader series={table.seriesB} />
            <th scope="col" className={`${C.HEAD_CELL} ${C.DIFFERENCE}`}>
              {t("climateComparison.difference")}
              <span className={C.MUTED_LINE}>
                <span className={C.NO_WRAP}>{table.minuend}</span>
                {DIFFERENCE_DIRECTION_SEPARATOR}
                <span className={C.NO_WRAP}>{table.subtrahend}</span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <ComparisonTableRow key={row.metric} row={row} table={table} />
          ))}
        </tbody>
      </table>
    </Card>
  );
}
