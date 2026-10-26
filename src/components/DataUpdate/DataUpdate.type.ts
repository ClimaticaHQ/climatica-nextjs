import type { TDataUpdateInput } from "@/types";
import type { ReactNode } from "react";

export type TDataUpdateProviderProps = TDataUpdateInput & {
  /** the data layer's own fetching state (React Query isFetching) */
  isFetching: boolean;
  children: ReactNode;
};

export type TDataUpdateFadeProps = {
  /** fill the parent's height (the map) */
  isFullHeight?: boolean | undefined;
  children: ReactNode;
};
