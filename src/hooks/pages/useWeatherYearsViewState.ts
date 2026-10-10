import type { TPair, TUseWeatherYearsViewStateArgs } from "@/types";
import {
  getDefaultShownYears,
  isSameYears,
  resolveShownYears,
  resolveYearPair,
} from "@/utils/pair.util";
import { useState } from "react";

/**
 * The compared weather years' view state: the pair drawn side by side and the years shown in
 * the overlay. What the reader picked (or a link carried) is resolved against the compared
 * years, so a removed year falls back; until a chip is touched each chart type shows its default
 * (Walter-Lieth the pair, standard every year). Only picks that differ go to the URL.
 */
export function useWeatherYearsViewState({
  years,
  isWeather,
  chartMode,
}: TUseWeatherYearsViewStateArgs) {
  const [requestedPair, setRequestedPair] = useState<TPair<number> | null>(null);
  const [requestedShown, setRequestedShown] = useState<readonly number[] | null>(null);

  const pair = isWeather ? resolveYearPair(years, requestedPair) : null;
  const isDefaultPair = pair === null || (pair[0] === years[0] && pair[1] === years[1]);
  const defaultShown = getDefaultShownYears({
    years,
    pair,
    isWalterLieth: chartMode === "walter-lieth",
  });
  const shown = resolveShownYears({ years, requested: requestedShown, defaultYears: defaultShown });
  const hasPickedShown =
    requestedShown !== null && years.some((year) => requestedShown.includes(year));

  // * a pick that is the current default is "follow the default"
  const onShownChange = (next: readonly number[]) =>
    setRequestedShown(isSameYears(next, defaultShown) ? null : next);

  return {
    /** the chart's view state: the pair and the shown years by series id (the year) */
    chartViewState: {
      ...(pair && {
        pair: {
          value: [String(pair[0]), String(pair[1])] as const,
          onChange: ([a, b]: TPair<string>) => setRequestedPair([Number(a), Number(b)]),
        },
      }),
      shown: {
        value: shown.map(String),
        onChange: (ids: readonly string[]) => onShownChange(ids.map(Number)),
      },
    },
    /** URL state: the pair and the shown years only when picked, the defaults left out */
    urlPair: isDefaultPair ? null : pair,
    urlShown: isWeather && hasPickedShown ? shown : null,
    setRequestedPair,
    setRequestedShown,
  };
}
