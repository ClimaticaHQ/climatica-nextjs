import { createContext } from "react";
import type { TInfoNavigation } from "./info.type";

/**
 * The Info navigation, provided once around the side panel and <main> (AppLayout on an Info
 * page): one scroll spy and one Contents sheet for the panel, the bar and the sheet.
 */
export const InfoNavigationContext = createContext<TInfoNavigation | null>(null);
