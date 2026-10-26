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

/** Every param a filter is read from — current and legacy. */
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

/**
 * The filters a URL describes. Absent, invalid or unknown values — and values the URL's
 * dataset doesn't use — are the defaults; the result is normalized.
 */
export function parseFilters(params: URLSearchParams): TFilters {
  const filters: TFilters = { ...FILTER_DEFAULTS };
  FILTER_ORDER.forEach((key) => {
    // * dataset comes first in the order, so the rest are checked against the parsed one
    if (isFilterRelevant(key, filters.dataset)) readFilter(filters, key, params);
  });
  return normalizeFilters(filters);
}

/**
 * The URL params for these filters, on top of `base` (page params kept, its filter params
 * replaced): only values the dataset uses and that differ from the default; legacy params
 * are never written.
 */
export function serializeFilters(
  filters: TFilters,
  base: URLSearchParams = new URLSearchParams(),
): URLSearchParams {
  const params = omitFilterParams(base);
  const normalized = normalizeFilters(filters);
  FILTER_ORDER.forEach((key) => writeFilter(params, key, normalized));
  return params;
}

/** A URL's params without any filter param — what a page's own URL state is made of. */
export function omitFilterParams(params: URLSearchParams): URLSearchParams {
  const pageParams = new URLSearchParams(params);
  FILTER_PARAM_NAMES.forEach((name) => pageParams.delete(name));
  return pageParams;
}

/** A page's own params, with the filters `source` describes (canonical) after them. */
export function withFilterParams(
  pageParams: URLSearchParams,
  source: URLSearchParams,
): URLSearchParams {
  return serializeFilters(parseFilters(source), pageParams);
}

/** Only the filter params of a URL, canonical — e.g. for links to other pages. */
export function pickFilterParams(params: URLSearchParams): URLSearchParams {
  return serializeFilters(parseFilters(params));
}

function sortedString(params: URLSearchParams) {
  const copy = new URLSearchParams(params);
  copy.sort();
  return copy.toString();
}

/**
 * The URL to replace the current one with when its filter params aren't canonical (a default
 * written out, an invalid value, a legacy param, a value normalization changed); null when
 * the address already matches what's rendered.
 */
export function getCanonicalFilterUrlParams(params: URLSearchParams): URLSearchParams | null {
  const canonical = serializeFilters(parseFilters(params), params);
  return sortedString(canonical) === sortedString(params) ? null : canonical;
}

/** Whether two filter sets put the same filters in the URL. */
export function areFiltersEqual(a: TFilters, b: TFilters) {
  return serializeFilters(a).toString() === serializeFilters(b).toString();
}

/** A remembered value, re-read through the filter's codec: null when it's no longer valid. */
function readRemembered<K extends EFilterKey>(key: K, remembered: TFilters) {
  const codec = FILTER_CODECS[key];
  const params = new URLSearchParams({
    [FILTERS_CONFIG[key].param]: codec.encode(remembered[key]),
  });
  return codec.parse(params);
}

/**
 * Whether the switch away is all that changed the value since: the dataset's own values (the
 * URL dropped them), or a shared one the switch narrowed (a Climate-only variable, 30″) that the
 * reader hasn't changed since.
 */
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
  // * a value the reader changed in the draft since the URL's is theirs
  if (!isSameFilterValue(key, target[key], sources.applied[key])) return;
  if (!isDroppedBySwitch(key, sources)) return;
  const value = readRemembered(key, sources.remembered);
  if (value !== null) target[key] = value;
}

/**
 * Switching to a dataset the URL doesn't hold brings back what the last switch away dropped
 * (the URL keeps only the active dataset's values): its own periods or years, and a variable or
 * resolution only it offers. Values no longer valid stay at their default; the result is
 * normalized, so a restored value the restored period doesn't offer drops out again.
 */
export function restoreDatasetSelection({
  next,
  previousDataset,
  applied,
  selections,
}: TRestoreDatasetSelectionArgs): TFilters {
  const remembered = selections[next.dataset];
  const isSwitchAway = next.dataset !== previousDataset && next.dataset !== applied.dataset;
  if (!isSwitchAway || remembered === undefined) return next;
  // * what the switch away made of the remembered filters
  const leftAs = normalizeFilters({ ...remembered, dataset: applied.dataset });
  const restored = { ...next };
  FILTER_ORDER.forEach((key) => restoreFilter(restored, key, { applied, remembered, leftAs }));
  return normalizeFilters(restored);
}
