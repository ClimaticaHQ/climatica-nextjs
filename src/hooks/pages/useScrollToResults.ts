import { SCROLL_TO_RESULTS_DELAY_MS } from "@/constants";
import { useSettingsStore } from "@/stores";
import type { TUseScrollToResultsArgs } from "@/types";
import { scrollToSection } from "@/utils";
import { useCallback, useEffect, useRef } from "react";

/** a city from the URL or storage never scrolls */
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
