import type { DATA_UPDATE_ALL_SERIES } from "@/constants";
import type { EUpdateFlashVariant } from "@/enums";

/** A page's data by series key (A / B, or the single city) — any plain, comparable data. */
export type TDataUpdateSeries = Record<string, unknown>;

/** The latest data update: which series changed, counted from the first load. */
export type TDataUpdate = {
  /** 0 until the data first changes after loading, then +1 per update */
  id: number;
  changed: readonly string[];
};

export type TDataUpdateState = {
  values: TDataUpdateSeries;
  update: TDataUpdate;
  /** the screen-reader message for the latest update */
  announcement: string;
};

export type TDataUpdateInput = {
  series: TDataUpdateSeries;
  announcement: string;
};

export type TDataUpdateContext = {
  update: TDataUpdate;
  /** true only within the commit that produced this update — cards mounting later (chart
   * type or layout switches) never flash for it. Call it in effects, not while rendering */
  isFresh: (id: number) => boolean;
  /** fetching for longer than MOTION.UPDATE_LOADING_DELAY_MS */
  isLoading: boolean;
};

/** The series a card shows: some keys, or every series (the chart card) */
export type TUpdateFlashKeys = readonly string[] | typeof DATA_UPDATE_ALL_SERIES;

export type TShouldFlashArgs = {
  update: TDataUpdate;
  isFresh: boolean;
  /** the update this card last handled, null before its first */
  handledId: number | null;
  keys: TUpdateFlashKeys;
};

export type TUpdateFlashKeyframeArgs = {
  /** the flash colors, resolved from the card's CSS tokens */
  border: string;
  glow: string;
  variant: EUpdateFlashVariant;
};

export type TDelayedFlagArgs = {
  delayMs: number;
  onChange: (value: boolean) => void;
};
