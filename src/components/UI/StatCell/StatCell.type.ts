import type { ReactNode } from "react";

export type TStatCellProps = {
  label: string;
  fullLabel?: string;
  title?: string;
  value: ReactNode;
  hasMetaRow: boolean;
  meta?: ReactNode;
  cellClassName: string;
  marker?: ReactNode;
};
