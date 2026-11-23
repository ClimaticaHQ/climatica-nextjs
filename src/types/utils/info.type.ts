import type { EDisplayMetric } from "@/enums";
import type { TCellSize } from "../domain/climate";
import type { TClimatePeriod } from "@/constants/worldclim.constant";

/** A grid's resolution as an angle: 2.5 arc-minutes, 30 arc-seconds. */
export type TGridArc = {
  value: number;
  symbol: string;
  metric: EDisplayMetric.ARC_MINUTES | EDisplayMetric.ARC_SECONDS;
};

/** One row of the Data & methods resolutions table. */
export type TResolutionRow = {
  size: TCellSize;
  /** the cell's side at the equator */
  cellSizeKm: number;
  /** the climate normals it exists for */
  climatePeriods: TClimatePeriod[];
  /** whether the weather years have it */
  hasWeather: boolean;
};

export type TCopyrightYearsArgs = {
  firstYear: number;
  currentYear: number;
};

/** What a reference's link is built from: a DOI link, or a title to search for. */
export type TReferenceLinkArgs = { url?: string | undefined; title?: string | undefined };

/** A reference's link: its href and its visible text. */
export type TReferenceLink = { href: string; label: string };
