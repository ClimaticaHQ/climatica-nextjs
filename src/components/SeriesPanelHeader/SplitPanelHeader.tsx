import { SeriesMarker } from "@/components/SeriesMarker";
import { getPanelSubtitle } from "@/utils";
import { SPLIT_PANEL_HEADER_CLASSES as C } from "./SeriesPanelHeader.constant";
import type { TSplitPanelHeaderProps } from "./SeriesPanelHeader.type";

/**
 * A split panel's header — marker (A dot, B square), name, "{period} · {altitude}" and the
 * expand / collapse controls. The comparison table above the chart carries the stats.
 */
export function SplitPanelHeader({ series, slots }: TSplitPanelHeaderProps) {
  return (
    <figcaption className={C.FRAME}>
      <div className={C.TITLE_BLOCK}>
        <div className={C.NAME_ROW}>
          {/* * a picker in place of the name shows the colour dot itself */}
          {slots?.name ?? (
            <>
              <SeriesMarker id={series.id} color={series.markerColor} />
              <span className={C.NAME} title={series.label}>
                {series.label}
              </span>
            </>
          )}
        </div>
        <p className={C.SUBTITLE}>{getPanelSubtitle(series)}</p>
      </div>
      {slots?.actions}
    </figcaption>
  );
}
