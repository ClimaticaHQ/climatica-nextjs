import { SeriesMarker } from "@/components/SeriesMarker";
import { MONTHLY_VALUES_CLASSES as C } from "../MonthlyValuesTable.constant";
import type { TValueStackProps } from "../MonthlyValuesTable.type";

/**
 * A cell's value(s): one series' value, or A's above B's in their text colour, each after its
 * series' marker when given — each named for screen readers.
 */
export function ValueStack({ entries, markers, className }: TValueStackProps) {
  if (entries.length === 1 && entries[0]) return <>{entries[0].text}</>;
  return (
    <span className={className}>
      {entries.map((entry, index) => (
        <span key={entry.srText} className={C.VALUE_LINE} style={{ color: entry.color }}>
          {markers?.[index] && (
            <span aria-hidden className={C.MARKER_LINE}>
              <SeriesMarker {...markers[index]} />
            </span>
          )}
          <span aria-hidden>{entry.text}</span>
          <span className={C.SR_ONLY}>{entry.srText}</span>
        </span>
      ))}
    </span>
  );
}
