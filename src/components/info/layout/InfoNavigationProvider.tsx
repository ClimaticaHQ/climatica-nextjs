"use client";

import { useInfoNavigation } from "@/hooks/pages/useInfoNavigation";
import { InfoNavigationContext } from "../infoNavigation.context";
import type { TInfoNavigationProviderProps } from "../info.type";

export function InfoNavigationProvider({ children }: TInfoNavigationProviderProps) {
  const nav = useInfoNavigation();
  return <InfoNavigationContext.Provider value={nav}>{children}</InfoNavigationContext.Provider>;
}
