import { ChartFocusContext } from "@/components/charts/chartFocus.context";
import { FOCUS_CONTEXT } from "@/constants";
import { getEntityRole } from "@/utils";
import { useContext } from "react";
import { MONTHLY_VALUES_CLASSES as C } from "../MonthlyValuesTable.constant";
import type { TRowHeadersProps } from "../MonthlyValuesTable.type";

/**
 * The standard overlay's row header: each series' short label as text (1967, ’70–’00, MAD), one
 * level with its value line — the chips and the legend hold the markings. Its full name on hover;
 * hovering or focusing it focuses the entity; another entity focused, it's muted like its values.
 */
export function RowHeaders({ row, markers, keys }: TRowHeadersProps) {
  const focus = useContext(ChartFocusContext);
  return (
    <span className={C.HEADERS}>
      <span className={C.SR_ONLY}>{`${row.name} (${row.unit})`}</span>
      {markers.map(({ label, title }, index) => {
        const key = keys[index] ?? null;
        const isContext = getEntityRole(focus?.focusedId ?? null, key ?? "") === "context";
        const enter = () => focus?.onEntityFocus(key);
        const leave = () => focus?.onEntityFocus(null);
        return (
          <span
            key={index}
            tabIndex={0}
            title={title}
            aria-label={title}
            className={C.HEADER}
            style={isContext ? { color: FOCUS_CONTEXT.TEXT } : undefined}
            onMouseEnter={enter}
            onMouseLeave={leave}
            onFocus={enter}
            onBlur={leave}
          >
            <span className={C.HEADER_TEXT}>{label}</span>
          </span>
        );
      })}
    </span>
  );
}
