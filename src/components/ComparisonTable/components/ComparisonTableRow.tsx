import { COMPARISON_METRIC_LABEL_KEYS, WALTER_LIETH_COLORS } from "@/constants";
import { useTranslations } from "next-intl";
import { COMPARISON_TABLE_CLASSES as C } from "../ComparisonTable.constant";
import type { TComparisonTableRowProps } from "../ComparisonTable.type";
import { ComparisonValueCell } from "./ComparisonValueCell";

/** One metric: its label, A and B in their series colors, the difference muted. */
export function ComparisonTableRow({ row, table }: TComparisonTableRowProps) {
  const t = useTranslations();
  return (
    <tr className={C.ROW}>
      <th scope="row" className={C.METRIC_CELL}>
        {t(COMPARISON_METRIC_LABEL_KEYS[row.metric])}
      </th>
      <ComparisonValueCell value={row.a} color={WALTER_LIETH_COLORS.SERIES[table.seriesA.id]} />
      <ComparisonValueCell
        value={row.b}
        color={WALTER_LIETH_COLORS.SERIES[table.seriesB.id]}
        difference={row.difference}
      />
      <td className={C.DIFFERENCE_CELL}>{row.difference}</td>
    </tr>
  );
}
