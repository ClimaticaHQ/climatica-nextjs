import { MONTHLY_VALUES_CLASSES as C } from "../MonthlyValuesTable.constant";
import type { TUnitLabelProps } from "../MonthlyValuesTable.type";

/** A row's only label: its unit in its chart color — the full name for screen readers. */
export function UnitLabel({ row }: TUnitLabelProps) {
  return (
    <>
      <span aria-hidden style={{ color: row.unitColor }}>
        {row.unit}
      </span>
      <span className={C.SR_ONLY}>{`${row.name} (${row.unit})`}</span>
    </>
  );
}
