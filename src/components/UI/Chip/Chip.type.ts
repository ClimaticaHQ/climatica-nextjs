import type { EChipVariant } from "@/enums";
import type { TBadgeTone } from "@/types";
import type { CSSProperties } from "react";
import type { CHIP_TONE_VARS } from "./Chip.constant";

export type TToggleChipProps = {
  variant?: EChipVariant.TOGGLE;
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  /** active, but can't be turned off — a not-allowed cursor, announced as disabled */
  isLocked?: boolean;
  /** a colour dot before the label — e.g. a compared year's series colour */
  dotColor?: string;
  /** a tint set for its active, locked and hover states (a compared year's); the active chip's
   * green when omitted */
  tone?: TBadgeTone;
  onClick: () => void;
};

/** A chip's tone as its custom properties — assignable to a `style` prop. */
export type TChipToneStyle = CSSProperties &
  Record<(typeof CHIP_TONE_VARS)[keyof typeof CHIP_TONE_VARS], string>;

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
