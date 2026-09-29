import type { CSSProperties, ReactNode } from "react";

/** The side an expanding panel grows from — where it sits in the split. */
export type TTransformOrigin = "left" | "right";

export type TChartTransitionProps = {
  /** changes when the content should crossfade — e.g. chart type and layout */
  transitionKey: string;
  /** set for a split panel expanding / switching: fade plus a slight scale from this side */
  enterOrigin?: TTransformOrigin | undefined;
  children: ReactNode;
};

/** A rendered piece of content, kept as it last looked while it fades out. */
export type TTransitionLayer = {
  key: string;
  node: ReactNode;
};

/** Inline animation timing, plus the scale start the `chart-expand-in` keyframes read. */
export type TTransitionStyle = CSSProperties & {
  "--chart-expand-scale-from"?: string;
};
