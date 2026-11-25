import type { ESlidingIndicatorAxis } from "@/enums";

export type TIndicatorRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type TSlidingIndicatorState = TIndicatorRect & {
  isAnimated: boolean;
};

export type TSlidingIndicatorArgs = {
  activeKey: string | null;
  activeSelector: string;
  toTargetRect?: ((args: TIndicatorTargetArgs) => TIndicatorRect) | undefined;
};

export type TIndicatorTargetArgs = TIndicatorRectArgs & {
  rect: TIndicatorRect;
};

export type TIndicatorRectArgs = {
  container: HTMLElement;
  item: HTMLElement;
};

export type TIndicatorStyleArgs = {
  rect: TIndicatorRect;
  axis: ESlidingIndicatorAxis;
};
