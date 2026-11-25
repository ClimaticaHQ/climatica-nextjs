import { ENTITY_SHORT_LABEL as E } from "@/constants";
import { ESeriesKind } from "@/enums";
import type { TEntityLabelSource } from "@/types";

function getShortPeriod(label: string) {
  const [from, to] = label.match(E.PERIOD_YEARS) ?? [];
  if (from === undefined || to === undefined) return label;
  const short = (year: string) => `${E.YEAR_PREFIX}${year.slice(-E.YEAR_DIGITS)}`;
  return `${short(from)}${E.PERIOD_SEPARATOR}${short(to)}`;
}

function getCityCodes(labels: readonly string[]) {
  const letters = labels.map((label) => label.replace(E.NON_LETTERS, "").toUpperCase());
  return letters.map((own, i) => {
    let length = E.CITY_CODE_LENGTH;
    const clashes = () =>
      letters.some((other, j) => j !== i && other.slice(0, length) === own.slice(0, length));
    while (length < own.length && clashes()) length += 1;
    return own.slice(0, length);
  });
}

export function getEntityShortLabels(entities: readonly TEntityLabelSource[]) {
  const cities = entities.flatMap(({ kind, label }, i) =>
    kind === ESeriesKind.CITY ? [{ i, label }] : [],
  );
  const codes = getCityCodes(cities.map(({ label }) => label));
  const codeOf = new Map(cities.map(({ i }, n) => [i, codes[n]]));
  return entities.map(({ kind, label }, i) => {
    const forms = {
      [ESeriesKind.WEATHER_YEAR]: () => label,
      [ESeriesKind.CLIMATE_PERIOD]: () => getShortPeriod(label),
      [ESeriesKind.CITY]: () => codeOf.get(i) ?? label,
    } satisfies Record<ESeriesKind, () => string>;
    return forms[kind]();
  });
}
