import { SeriesMarker } from "@/components/SeriesMarker";
import { MONTHLY_VALUES_CLASSES as C } from "../MonthlyValuesTable.constant";
import type { TUnitLabelProps } from "../MonthlyValuesTable.type";

/**
 * A row's only label: its unit in its chart color — the full name for screen readers. In an
 * overlay, the series' markers beside it, one level with each value line.
 */
export function UnitLabel({ row, markers }: TUnitLabelProps) {
  const unit = (
    <>
      <span aria-hidden style={{ color: row.unitColor }}>
        {row.unit}
      </span>
      <span className={C.SR_ONLY}>{`${row.name} (${row.unit})`}</span>
    </>
  );
  if (markers.length === 0) return unit;
  return (
    <span className={C.UNIT_WITH_MARKERS}>
      <span>{unit}</span>
      <span aria-hidden className={C.MARKER_STACK}>
        {markers.map((marker, index) => (
          <span key={index} className={C.MARKER_LINE}>
            <SeriesMarker {...marker} />
          </span>
        ))}
      </span>
    </span>
  );
}
