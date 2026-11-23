import type { ESegmentedSize } from "@/enums";
import type { CSSProperties, ReactNode } from "react";

export type TSegmentedOption<TValue extends string> = {
  value: TValue;
  /** always visible; with isIconOnlyBelowSm, from Tailwind's `sm` up only */
  label: string;
  icon: ReactNode;
};

export type TSegmentedControlProps<TValue extends string> = {
  /** accessible name of the whole group */
  label: string;
  options: readonly TSegmentedOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  /** every option inert and dimmed — e.g. a setting that depends on another one that's off */
  isDisabled?: boolean | undefined;
  /** the active pill without a shadow: the card surface in a thin outline, primary text */
  isFlat?: boolean | undefined;
  /** below `sm` the options show only their icons (a dense chart toolbar); otherwise every label
   * shows, the segments equal */
  isIconOnlyBelowSm?: boolean | undefined;
  /** labels always shown and cut with an ellipsis where the room is short, never a list: a
   * control in a fixed box (the MiniMap's header); the full label stays the option's name */
  isLabelTruncated?: boolean | undefined;
  /** the pill's height below `sm`; DEFAULT when absent */
  size?: ESegmentedSize | undefined;
  /** the id of a text describing every option (a settings row's description) */
  ariaDescribedBy?: string | undefined;
};

/** The list's width: the room the control can take (TRACK_LIST). */
export type TSegmentedRoomStyle = CSSProperties & Record<"--segmented-room", string>;
