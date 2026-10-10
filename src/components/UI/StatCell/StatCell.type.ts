import type { ReactNode } from "react";

export type TStatCellProps = {
  label: string;
  /** full name for assistive tech when the visible label is shortened */
  fullLabel?: string;
  title?: string;
  value: ReactNode;
  /** reserve the meta row (badge / delta) so values align across bars; it may stay empty */
  hasMetaRow: boolean;
  meta?: ReactNode;
  cellClassName: string;
};
