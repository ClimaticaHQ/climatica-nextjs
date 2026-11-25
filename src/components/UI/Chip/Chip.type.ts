import type { EChipVariant, ETextScale } from "@/enums";
import type { TSeriesHatch, TSeriesShape } from "@/types";

export type TToggleChipProps = {
  variant?: EChipVariant.TOGGLE;
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  isLocked?: boolean;
  markerShape?: TSeriesShape;
  markerHatch?: TSeriesHatch | undefined;
  markerFill?: string | undefined;
  textScale?: ETextScale;
  onClick: () => void;
};

export type TValueChipProps = {
  variant: EChipVariant.VALUE;
  value: string;
  ariaLabel: string;
  isChanged: boolean;
  isDisabled: boolean;
  onClick: () => void;
};

export type TAllFiltersChipProps = {
  variant: EChipVariant.ALL_FILTERS;
  changedCount: number;
  onClick: () => void;
};

export type TChipProps = TToggleChipProps | TValueChipProps | TAllFiltersChipProps;
