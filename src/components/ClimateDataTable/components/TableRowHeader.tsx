import { SeriesMarkerIcon } from "@/components/svg";
import { TABLE_CLASSES as C } from "../ClimateDataTable.constant";
import type { TTableRowHeaderProps } from "../ClimateDataTable.type";

/** A row's label: the series marker (compare) before "Avg Temp (°C) — Madrid". */
export function TableRowHeader({ label, marker }: TTableRowHeaderProps) {
  return (
    <th scope="row" className={`${C.ROW_HEADER} ${C.STICKY}`}>
      <span className={C.ROW_LABEL} title={label}>
        {marker && (
          <span className="inline-flex shrink-0" style={{ color: marker.color }}>
            <SeriesMarkerIcon shape={marker.shape} />
          </span>
        )}
        <span className={C.ROW_LABEL_TEXT}>{label}</span>
      </span>
    </th>
  );
}
