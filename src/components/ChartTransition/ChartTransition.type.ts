import type { ReactNode } from "react";

export type TTransformOrigin = "left" | "right";

export type TChartTransitionProps = {
  transitionKey: string;
  enterOrigin?: TTransformOrigin | undefined;
  isPlaceholder?: boolean;
  children: ReactNode;
};

export type TTransitionLayer = {
  key: string;
  node: ReactNode;
  isPlaceholder: boolean;
};

export type TTransitionMotion = {
  durationMs: number;
  enterClassName: string;
  leaveClassName: string;
};
