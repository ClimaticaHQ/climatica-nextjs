import { SeriesMarker } from "@/components/SeriesMarker";
import { COMPARISON_TABLE_CLASSES as C } from "../ComparisonTable.constant";
import type { TSeriesHeaderProps } from "../ComparisonTable.type";

/** A series' column header: its marker (A dot, B square) and name. */
export function SeriesHeader({ series }: TSeriesHeaderProps) {
  return (
    <th scope="col" className={C.HEAD_CELL}>
      <span className={C.SERIES_NAME} title={series.label}>
        <SeriesMarker id={series.id} />
        <span className={C.SERIES_LABEL}>{series.label}</span>
      </span>
    </th>
  );
}
