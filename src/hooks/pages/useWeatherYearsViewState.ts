import type { TPair, TUseWeatherYearsViewStateArgs } from "@/types";
import {
  getDefaultShownYears,
  isSameYears,
  resolveShownYears,
  resolveYearPair,
} from "@/utils/pair.util";
import { useState } from "react";

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
    urlPair: isDefaultPair ? null : pair,
    urlShown: isWeather && hasPickedShown ? shown : null,
    setRequestedPair,
    setRequestedShown,
  };
}
