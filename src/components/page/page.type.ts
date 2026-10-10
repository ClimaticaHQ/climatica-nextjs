import type { TDataState, TPageUpdate } from "@/types";
import type { ReactNode, RefObject } from "react";

export type TPageLayoutProps = {
  title: string;
  description: string;
  /** search, mini maps, the filter bar — what the reader picks with */
  controls: ReactNode;
  /** a map to pick the place on, at the page's spacing below the controls */
  map?: ReactNode;
  /** the results' state: an empty or error message shows between the controls and the results */
  state: TDataState;
  /** flashes and announces the results' updates */
  update?: TPageUpdate | undefined;
  /** the results' frame — where a picked city scrolls to */
  resultsRef?: RefObject<HTMLDivElement | null> | undefined;
  /** before the main content: stat cards, the region's stats */
  summary?: ReactNode;
  /** the chart section, or the heat map */
  main: ReactNode;
  /** after the main content: difference cards, the region's profile */
  details?: ReactNode;
};

export type TPageStatusProps = {
  state: TDataState;
};

export type TPageResultsProps = {
  update?: TPageUpdate | undefined;
  children: ReactNode;
};
