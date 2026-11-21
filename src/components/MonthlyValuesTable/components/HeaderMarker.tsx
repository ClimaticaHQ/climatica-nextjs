import { ChartFocusContext } from "@/components/charts/chartFocus.context";
import { SeriesMarker } from "@/components/SeriesMarker";
import { FOCUS_CONTEXT } from "@/constants";
import { getEntityRole } from "@/utils";
import { useContext } from "react";
import { MONTHLY_VALUES_CLASSES as C } from "../MonthlyValuesTable.constant";
import type { THeaderMarkerProps } from "../MonthlyValuesTable.type";

/**
 * A series' marker beside its row's unit — its shape only, the axis-wide column has no room for
 * the hatch. Named (the standard overlay): its full name as its accessible name and on hover;
 * hovering or focusing it focuses the entity; another entity focused, it's muted like the context
 * curves. Unnamed (the Walter-Lieth overlay): decoration, the legend names it.
 */
export function HeaderMarker({ marker, entityKey }: THeaderMarkerProps) {
  const focus = useContext(ChartFocusContext);
  const { shape, title } = marker;
  if (title === undefined)
    return (
      <span aria-hidden className={C.MARKER_LINE}>
        <SeriesMarker shape={shape} />
      </span>
    );

  const isContext = getEntityRole(focus?.focusedId ?? null, entityKey) === "context";
  const enter = () => focus?.onEntityFocus(entityKey);
  const leave = () => focus?.onEntityFocus(null);
  return (
    <span
      role="img"
      tabIndex={0}
      title={title}
      aria-label={title}
      className={C.HEADER_MARKER}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={enter}
      onBlur={leave}
    >
      <SeriesMarker shape={shape} {...(isContext ? { color: FOCUS_CONTEXT.LINE } : {})} />
    </span>
  );
}
