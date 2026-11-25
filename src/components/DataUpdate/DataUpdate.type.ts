import type { TDataUpdateInput } from "@/types";
import type { ReactNode } from "react";

export type TDataUpdateProviderProps = TDataUpdateInput & {
  isFetching: boolean;
  children: ReactNode;
};

export type TDataUpdateFadeProps = {
  isFullHeight?: boolean | undefined;
  children: ReactNode;
};
