import type { EChartBody } from "@/enums";
import type { BAR_STYLES } from "@/constants";
import type { TChartMode, TSeriesKey } from "../components/chart";
import type { TSeriesHatch } from "./seriesShape.type";

export type TOverlayScrollArgs = {
  availableWidth: number;
  entityCount: number;
  gap?: number;
  minGap?: number;
  isNarrow?: boolean;
  textScale?: number;
  minBand?: number;
};

export type TOverlayScroll = {
  isOverflowing: boolean;
  contentWidth: number;
  plotWidth: number;
};

export type TOverlayFocus =
  | { id: string; target: "line"; variable: Exclude<TSeriesKey, "prec"> }
  | { id: string; target: "bar" }
  | { id: string; target: "entity" };

export type TChartScroll = {
  contentWidth: number;
  register: (element: HTMLElement | null) => void;
};

export type TChartFocus = {
  focusedId: string | null;
  onEntityFocus: (id: string | null) => void;
};

export type TEntityRole = "focus" | "context" | "plain";

export type TOverlayBarLayoutArgs = {
  plotWidth: number;
  entityCount: number;
  gap?: number;
  minGap?: number;
};

export type TOverlayGapArgs = {
  bandWidth: number;
  count: number;
  gap: number;
  minGap: number;
};

export type TOverlayBarLayout = {
  bandWidth: number;
  barSize: number;
  gap: number;
  offsets: number[];
};

export type TBarStyle = (typeof BAR_STYLES)[number];

export type TOverlayBarStyle = {
  gap: number;
  minGap: number;
  hasHatch: boolean;
  hasShades: boolean;
};

export type TEntityBarSwatch = {
  hatch?: TSeriesHatch;
  fill?: string;
};

export type TPhoneOverlayBars = {
  barSize: number;
  gap: number;
  band: number;
};

export type TFixedOverlayBarLayoutArgs = {
  plotWidth: number;
  entityCount: number;
  barSize: number;
  gap: number;
};

export type TSwatchBarStyleArgs = {
  mode: TChartMode;
  body: EChartBody;
  barStyle: TBarStyle;
  isPrecVisible: boolean;
};
