import type { EDisplayMetric } from "@/enums";
import type { TCellSize } from "../domain/climate";
import type { TClimatePeriod } from "@/constants/worldclim.constant";

export type TGridArc = {
  value: number;
  symbol: string;
  metric: EDisplayMetric.ARC_MINUTES | EDisplayMetric.ARC_SECONDS;
};

export type TResolutionRow = {
  size: TCellSize;
  cellSizeKm: number;
  climatePeriods: TClimatePeriod[];
  hasWeather: boolean;
};

export type TCopyrightYearsArgs = {
  firstYear: number;
  currentYear: number;
};

export type TReferenceLinkArgs = { url?: string | undefined; title?: string | undefined };

export type TReferenceLink = { href: string; label: string };
