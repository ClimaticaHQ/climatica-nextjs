import type { TColorScale } from "@/types";
import { resolveColorScale } from "@/utils/colorScale.util";
import { useIsClient } from "./useIsClient";

/** A scale's stops with their colours read from the document's tokens; none on the server. */
export function useColorScale(scale: TColorScale) {
  const isClient = useIsClient();
  return isClient ? resolveColorScale(scale, getComputedStyle(document.documentElement)) : null;
}
