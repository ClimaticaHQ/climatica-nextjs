import { SCROLL_TO_RESULTS_DELAY_MS } from "@/constants";
import { useSettingsStore } from "@/stores";
import type { TUseScrollToResultsArgs } from "@/types";
import { scrollToSection } from "@/utils";
import { useCallback, useEffect, useRef } from "react";

/**
 * After the reader picks a city, scroll to the results once they're shown (settings:
 * autoScroll). A city from the URL or storage never scrolls. Returns the "picked" marker.
 */
export function useScrollToResults({
  targetRef,
  results,
  hasResults,
  scrollOptions,
}: TUseScrollToResultsArgs) {
  const { autoScroll } = useSettingsStore();
  const hasPickedRef = useRef(false);

  useEffect(() => {
    if (!hasResults || !targetRef.current) return;
    if (!hasPickedRef.current || !autoScroll) return;

    const timer = setTimeout(() => {
      if (targetRef.current) scrollToSection(targetRef.current, scrollOptions);
    }, SCROLL_TO_RESULTS_DELAY_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a page passes the same options every render
  }, [results, hasResults, autoScroll, targetRef]);

  const markPicked = useCallback(() => {
    hasPickedRef.current = true;
  }, []);

  return { markPicked };
}
