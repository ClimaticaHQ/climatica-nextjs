import { SeriesPanelHeader } from "./SeriesPanelHeader";
import type { TSplitPanelHeaderProps } from "./SeriesPanelHeader.type";

/** A split panel's header — compact, titled, with the series dot. Both chart types use it. */
export function SplitPanelHeader(props: TSplitPanelHeaderProps) {
  return <SeriesPanelHeader {...props} isCompact showTitle isPanel />;
}
