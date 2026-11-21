import { ChartFocusContext } from "@/components/charts/chartFocus.context";
import { ChartLoadingContext } from "@/components/charts/chartLoading.context";
import { TEXT_PLACEHOLDER_WIDTHS, TextPlaceholder } from "@/components/UI/TextPlaceholder";
import { SeriesMarker } from "@/components/SeriesMarker";
import { FOCUS_CONTEXT } from "@/constants";
import type { TMonthlyValuesEntry } from "@/types";
import { getEntityRole } from "@/utils";
import { useContext } from "react";
import { MONTHLY_VALUES_CLASSES as C } from "../MonthlyValuesTable.constant";
import type { TValueStackProps } from "../MonthlyValuesTable.type";

/**
 * A cell's value(s): one series' value, or A's above B's in their text colour (muted for the
 * overlay's context while another series is focused), each after its series' marker when given —
 * each named for screen readers.
 */
export function ValueStack({ entries, markers, className }: TValueStackProps) {
  const focusedId = useContext(ChartFocusContext)?.focusedId ?? null;
  // * while the data load: each value's place, in its line
  const isLoading = useContext(ChartLoadingContext);
  const text = (entry: TMonthlyValuesEntry) =>
    isLoading ? <TextPlaceholder widthClass={TEXT_PLACEHOLDER_WIDTHS.CELL} /> : entry.text;
  if (entries.length === 1 && entries[0]) return <>{text(entries[0])}</>;
  return (
    <span className={className}>
      {entries.map((entry, index) => (
        <span
          key={entry.srText}
          className={C.VALUE_LINE}
          style={{
            // * another series focused in the overlay: this one's values muted
            color:
              getEntityRole(focusedId, entry.key) === "context" ? FOCUS_CONTEXT.TEXT : entry.color,
          }}
        >
          {markers?.[index] && (
            <span aria-hidden className={C.MARKER_LINE}>
              <SeriesMarker {...markers[index]} />
            </span>
          )}
          <span aria-hidden>{text(entry)}</span>
          <span className={C.SR_ONLY}>{entry.srText}</span>
        </span>
      ))}
    </span>
  );
}
