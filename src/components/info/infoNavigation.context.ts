import { createContext } from "react";
import type { TInfoNavigation } from "./info.type";

export const InfoNavigationContext = createContext<TInfoNavigation | null>(null);
