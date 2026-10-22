import type { EChipVariant } from "@/enums";
import type { TSeriesHatch, TSeriesShape } from "@/types";

export type TToggleChipProps = {
  variant?: EChipVariant.TOGGLE;
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  /** active, but can't be turned off — a not-allowed cursor, announced as disabled */
  isLocked?: boolean;
  /** an entity's shape before the label — e.g. a compared year's */
  markerShape?: TSeriesShape;
  /** its bars' hatch beside the shape — entity chips that are the chart's legend */
  markerHatch?: TSeriesHatch;
  onClick: () => void;
};

export type TValueChipProps = {
  variant: EChipVariant.VALUE;
  value: string;
  /** "Climate period: 1961–1990" */
  ariaLabel: string;
  /** not the default value: drawn in the light green variant */
  isChanged: boolean;
  /** not changeable here: drawn muted; the click opens the explanation instead */
  isDisabled: boolean;
  onClick: () => void;
};

export type TAllFiltersChipProps = {
  variant: EChipVariant.ALL_FILTERS;
  /** filters set away from their default — the badge, hidden at 0 */
  changedCount: number;
  onClick: () => void;
};

export type TChipProps = TToggleChipProps | TValueChipProps | TAllFiltersChipProps;
