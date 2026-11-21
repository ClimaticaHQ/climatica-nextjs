import { MONTHLY_VALUES_CLASSES as C } from "../MonthlyValuesTable.constant";
import type { TUnitLabelProps } from "../MonthlyValuesTable.type";
import { HeaderMarker } from "./HeaderMarker";

/**
 * A row's header: its unit in its chart color — the full name for screen readers. In an overlay,
 * the series' markers beside it, one level with each value line, the unit centred across them.
 */
export function UnitLabel({ row, markers, keys }: TUnitLabelProps) {
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
      <span className={C.MARKER_STACK}>
        {markers.map((marker, index) => (
          <HeaderMarker key={index} marker={marker} entityKey={keys[index] ?? ""} />
        ))}
      </span>
    </span>
  );
}
