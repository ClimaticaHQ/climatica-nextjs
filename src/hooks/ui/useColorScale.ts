import type { TColorScale } from "@/types";
import { resolveColorScale } from "@/utils/colorScale.util";
import { useIsClient } from "./useIsClient";

export function useColorScale(scale: TColorScale) {
  const isClient = useIsClient();
  return isClient ? resolveColorScale(scale, getComputedStyle(document.documentElement)) : null;
}
