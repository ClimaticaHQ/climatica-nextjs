import type { DATA_UPDATE_ALL_SERIES } from "@/constants";
import type { EUpdateFlashVariant } from "@/enums";

export type TDataUpdateSeries = Record<string, unknown>;

export type TDataUpdate = {
  id: number;
  changed: readonly string[];
};

export type TDataUpdateState = {
  values: TDataUpdateSeries;
  update: TDataUpdate;
  announcement: string;
};

export type TDataUpdateInput = {
  series: TDataUpdateSeries;
  announcement: string;
};

export type TDataUpdateContext = {
  update: TDataUpdate;
  /** true only within the update's own commit: call it in an effect; cards mounting later never flash for it */
  isFresh: (id: number) => boolean;
  isLoading: boolean;
};

export type TUpdateFlashKeys = readonly string[] | typeof DATA_UPDATE_ALL_SERIES;

export type TShouldFlashArgs = {
  update: TDataUpdate;
  isFresh: boolean;
  handledId: number | null;
  keys: TUpdateFlashKeys;
};

export type TUpdateFlashKeyframeArgs = {
  border: string;
  glow: string;
  variant: EUpdateFlashVariant;
};

export type TDelayedFlagArgs = {
  delayMs: number;
  onChange: (value: boolean) => void;
};
