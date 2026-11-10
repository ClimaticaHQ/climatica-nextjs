import { CACHE_STATUS } from "@/constants/api/api.constant";
import { P95, SCRAPI_ENDPOINT_PREFIX } from "./benchmark.constant";
import type {
  TCoverageIssue,
  TDistribution,
  TExclusionReason,
  TGroupSummary,
  TPairResult,
} from "./benchmark.type";

function percentile(sorted: number[], p: number): number {
  return sorted[Math.max(0, Math.ceil(p * sorted.length) - 1)] ?? 0;
}

function median(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
    : (sorted[mid] ?? 0);
}

const sortNumbers = (values: number[]) => [...values].sort((a, b) => a - b);

export function distribution(values: number[]): TDistribution | null {
  if (values.length === 0) return null;
  const sorted = sortNumbers(values);
  return { median: median(sorted), p95: percentile(sorted, P95) };
}

const medianOf = (values: number[]) => (values.length === 0 ? null : median(sortNumbers(values)));

const isNumber = (value: number | null): value is number => value !== null;

/** One row per endpoint and resolution, in the order the run first met them */
export const groupKey = ({
  file,
  endpoint,
  grid,
}: Pick<TPairResult, "file" | "endpoint" | "grid">) => `${file}|${endpoint}|${grid ?? ""}`;

/** An answered pair whose cold X-Cache disagrees with the app's edge rule */
const isBypassMismatch = (pair: TPairResult) =>
  pair.cold.error === null && (pair.cold.xCache === CACHE_STATUS.BYPASS) !== pair.isPredictedBypass;

const countExcluded = (pairs: TPairResult[], exclusion: TExclusionReason) =>
  pairs.filter((pair) => pair.exclusion === exclusion).length;

export function summarizeGroup(pairs: TPairResult[]): TGroupSummary | null {
  const first = pairs[0];
  if (!first) return null;
  const valid = pairs.filter((pair) => pair.reason === null);
  const cold = distribution(valid.map((pair) => pair.cold.ms));
  const warm = distribution(valid.map((pair) => pair.warm.ms));
  const upstream = valid.map((pair) => pair.cold.upstreamMs).filter(isNumber);
  const shares = valid
    .filter((pair) => pair.cold.upstreamMs !== null && pair.cold.ms > 0)
    .map((pair) => (pair.cold.upstreamMs ?? 0) / pair.cold.ms);
  return {
    file: first.file,
    endpoint: first.endpoint,
    grid: first.grid,
    validPairs: valid.length,
    totalPairs: pairs.length,
    excludedNearEdge: countExcluded(pairs, "nearEdge"),
    excludedNoData: countExcluded(pairs, "noData"),
    excludedError: countExcluded(pairs, "error"),
    excludedOther: countExcluded(pairs, "other"),
    bypassMismatches: pairs.filter(isBypassMismatch).length,
    cold,
    warm,
    speedUp: cold && warm && warm.median > 0 ? cold.median / warm.median : null,
    upstreamMedianMs: medianOf(upstream),
    upstreamShareMedian: medianOf(shares),
    bytesMedian: medianOf(valid.map((pair) => pair.cold.bytes)),
    bindingsMedian: medianOf(valid.map((pair) => pair.cold.bindings).filter(isNumber)),
    periods: [...new Set(valid.flatMap((pair) => pair.cold.periods))].sort(),
  };
}

function groupBy(pairs: TPairResult[], key: (pair: TPairResult) => string) {
  const groups = new Map<string, TPairResult[]>();
  for (const pair of pairs) groups.set(key(pair), [...(groups.get(key(pair)) ?? []), pair]);
  return [...groups.values()];
}

export function summarize(pairs: TPairResult[]): TGroupSummary[] {
  return groupBy(pairs, groupKey)
    .map(summarizeGroup)
    .filter((summary) => summary !== null);
}

const union = (lists: string[][]) => [...new Set(lists.flat())].sort();

/**
 * The cities whose SCRAPI answer at an endpoint and resolution was empty, failed or held less
 * than the full answers there (the most bindings, every variable and period any city got) — a
 * coastal or island cell without WorldClim data. Each with what SCRAPI returned, cold, per run.
 */
export function findCoverageIssues(pairs: TPairResult[]): TCoverageIssue[] {
  const scrapi = pairs.filter((pair) => pair.endpoint.startsWith(SCRAPI_ENDPOINT_PREFIX));
  return groupBy(scrapi, groupKey).flatMap((group) => {
    const colds = group.map((pair) => pair.cold);
    const expectedBindings = Math.max(0, ...colds.map((m) => m.bindings ?? 0));
    const variables = union(colds.map((m) => m.variables));
    const periods = union(colds.map((m) => m.periods));
    return groupBy(group, (pair) => pair.place ?? pair.url).flatMap((placePairs) => {
      const answers = placePairs.map((pair) => pair.cold);
      const isShort = answers.some(
        (m) => m.error !== null || m.isEmpty || (m.bindings ?? 0) < expectedBindings,
      );
      const first = placePairs[0];
      if (!isShort || !first) return [];
      const got = (list: (m: (typeof answers)[number]) => string[]) => union(answers.map(list));
      return [
        {
          place: first.place ?? first.url,
          endpoint: first.endpoint,
          grid: first.grid,
          statuses: answers.map((m) => m.status),
          bindings: answers.map((m) => m.bindings),
          expectedBindings,
          missingVariables: variables.filter((v) => !got((m) => m.variables).includes(v)),
          missingPeriods: periods.filter((p) => !got((m) => m.periods).includes(p)),
        },
      ];
    });
  });
}
