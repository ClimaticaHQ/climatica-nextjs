import { SeriesMarker } from "@/components/SeriesMarker";
import { getPanelSubtitle } from "@/utils";
import { SPLIT_PANEL_HEADER_CLASSES as C } from "./SeriesPanelHeader.constant";
import type { TSplitPanelHeaderProps } from "./SeriesPanelHeader.type";

export function SplitPanelHeader({ series, slots }: TSplitPanelHeaderProps) {
  return (
    <figcaption className={C.FRAME}>
      <div className={C.TITLE_BLOCK}>
        <div className={C.NAME_ROW}>
          {slots?.name ?? (
            <>
              {series.shape && <SeriesMarker shape={series.shape} />}
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
