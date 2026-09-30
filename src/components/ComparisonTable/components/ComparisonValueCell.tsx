import { MartonneBadge } from "@/components/MartonneBadge";
import { COMPARISON_TABLE_CLASSES as C } from "../ComparisonTable.constant";
import type { TComparisonValueCellProps } from "../ComparisonTable.type";

/** A series' value in its color — with the Martonne badge, and (B, below `sm`) the difference. */
export function ComparisonValueCell({ value, color, difference }: TComparisonValueCellProps) {
  return (
    <td className={C.VALUE_CELL} style={{ color }}>
      <span className={C.VALUE_LINE}>
        {value.badge && <MartonneBadge badge={value.badge} />}
        {value.text}
      </span>
      {difference && <span className={`${C.MUTED_LINE} ${C.DIFFERENCE_BELOW}`}>{difference}</span>}
    </td>
  );
}
