import { FILTER_DEFAULTS, FILTER_ORDER, FILTERS_CONFIG } from "@/constants";
import type { EFilterKey } from "@/enums";
import type { TFilters, TRestoreDatasetSelectionArgs, TRestoreFilterSources } from "@/types";
import { FILTER_CODECS } from "./filterCodecs.util";
import {
  isFilterDefault,
  isFilterRelevant,
  normalizeFilters,
  isSameFilterValue,
} from "./filters.util";

const FILTER_PARAM_NAMES: readonly string[] = FILTER_ORDER.flatMap((key) => [
  FILTERS_CONFIG[key].param,
  ...(FILTERS_CONFIG[key].legacyParams ?? []),
]);

function readFilter<K extends EFilterKey>(target: TFilters, key: K, params: URLSearchParams) {
  const value = FILTER_CODECS[key].parse(params);
  if (value !== null) target[key] = value;
}

function writeFilter<K extends EFilterKey>(params: URLSearchParams, key: K, filters: TFilters) {
  const value = filters[key];
  if (!isFilterRelevant(key, filters.dataset) || isFilterDefault(key, value)) return;
  params.set(FILTERS_CONFIG[key].param, FILTER_CODECS[key].encode(value));
}

export function parseFilters(params: URLSearchParams): TFilters {
  const filters: TFilters = { ...FILTER_DEFAULTS };
  FILTER_ORDER.forEach((key) => {
    // * dataset comes first in the order, so the rest are checked against the parsed one
    if (isFilterRelevant(key, filters.dataset)) readFilter(filters, key, params);
  });
  return normalizeFilters(filters);
}

export function serializeFilters(
  filters: TFilters,
  base: URLSearchParams = new URLSearchParams(),
): URLSearchParams {
  const params = omitFilterParams(base);
  const normalized = normalizeFilters(filters);
  FILTER_ORDER.forEach((key) => writeFilter(params, key, normalized));
  return params;
}

export function omitFilterParams(params: URLSearchParams): URLSearchParams {
  const pageParams = new URLSearchParams(params);
  FILTER_PARAM_NAMES.forEach((name) => pageParams.delete(name));
  return pageParams;
}

export function withFilterParams(
  pageParams: URLSearchParams,
  source: URLSearchParams,
): URLSearchParams {
  return serializeFilters(parseFilters(source), pageParams);
}

export function pickFilterParams(params: URLSearchParams): URLSearchParams {
  return serializeFilters(parseFilters(params));
}

function sortedString(params: URLSearchParams) {
  const copy = new URLSearchParams(params);
  copy.sort();
  return copy.toString();
}

export function getCanonicalFilterUrlParams(params: URLSearchParams): URLSearchParams | null {
  const canonical = serializeFilters(parseFilters(params), params);
  return sortedString(canonical) === sortedString(params) ? null : canonical;
}

export function areFiltersEqual(a: TFilters, b: TFilters) {
  return serializeFilters(a).toString() === serializeFilters(b).toString();
}

function readRemembered<K extends EFilterKey>(key: K, remembered: TFilters) {
  const codec = FILTER_CODECS[key];
  const params = new URLSearchParams({
    [FILTERS_CONFIG[key].param]: codec.encode(remembered[key]),
  });
  return codec.parse(params);
}

function isDroppedBySwitch<K extends EFilterKey>(
  key: K,
  { applied, remembered, leftAs }: TRestoreFilterSources,
) {
  const filterDataset = FILTERS_CONFIG[key].dataset;
  if (filterDataset !== undefined) return filterDataset === remembered.dataset;
  return (
    isSameFilterValue(key, applied[key], leftAs[key]) &&
    !isSameFilterValue(key, leftAs[key], remembered[key])
  );
}

function restoreFilter<K extends EFilterKey>(
  target: TFilters,
  key: K,
  sources: TRestoreFilterSources,
) {
  if (!isSameFilterValue(key, target[key], sources.applied[key])) return;
  if (!isDroppedBySwitch(key, sources)) return;
  const value = readRemembered(key, sources.remembered);
  if (value !== null) target[key] = value;
}

export function restoreDatasetSelection({
  next,
  previousDataset,
  applied,
  selections,
}: TRestoreDatasetSelectionArgs): TFilters {
  const remembered = selections[next.dataset];
  const isSwitchAway = next.dataset !== previousDataset && next.dataset !== applied.dataset;
  if (!isSwitchAway || remembered === undefined) return next;
  const leftAs = normalizeFilters({ ...remembered, dataset: applied.dataset });
  const restored = { ...next };
  FILTER_ORDER.forEach((key) => restoreFilter(restored, key, { applied, remembered, leftAs }));
  return normalizeFilters(restored);
}
