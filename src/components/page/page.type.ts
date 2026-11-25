import type { TDataState, TPageUpdate } from "@/types";
import type { ReactNode, RefObject } from "react";

export type TPageLayoutProps = {
  title: string;
  description: string;
  controls?: ReactNode;
  map?: ReactNode;
  state?: TDataState;
  update?: TPageUpdate | undefined;
  resultsRef?: RefObject<HTMLDivElement | null> | undefined;
  summary?: ReactNode;
  main: ReactNode;
  details?: ReactNode;
};

export type TPageStatusProps = {
  state: TDataState;
};
