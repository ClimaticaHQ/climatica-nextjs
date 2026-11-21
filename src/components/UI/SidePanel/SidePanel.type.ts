import type { ReactNode } from "react";

export type TSidePanelProps = {
  /** the landmark's name; absent when its content names itself (a labelled nav) */
  label?: string;
  children: ReactNode;
  /** under the scrolling body, always in view */
  footer?: ReactNode;
};
