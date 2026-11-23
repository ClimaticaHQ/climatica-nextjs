import type { ESlidingIndicatorAxis } from "@/enums";

/** An item's box inside its list's padding box, in px: where a sliding indicator sits. */
export type TIndicatorRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/** A sliding indicator's place, and whether it slides there or jumps (resize, fonts, first). */
export type TSlidingIndicatorState = TIndicatorRect & {
  isAnimated: boolean;
};

export type TSlidingIndicatorArgs = {
  /** changes when another item becomes active: the indicator slides to it */
  activeKey: string | null;
  /** finds the active item inside the list (its aria-current, aria-pressed or data attribute) */
  activeSelector: string;
};

export type TIndicatorRectArgs = {
  /** the list the indicator is positioned in */
  container: HTMLElement;
  item: HTMLElement;
};

export type TIndicatorStyleArgs = {
  rect: TIndicatorRect;
  axis: ESlidingIndicatorAxis;
};
