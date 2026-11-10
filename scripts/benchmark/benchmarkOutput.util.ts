import {
  BYTES_PER_KB,
  CSV_COLUMNS,
  GRID_LATEX_LABELS,
  MS_DECIMALS,
  NO_GRID_LABEL,
  PERCENT_DECIMALS,
} from "./benchmark.constant";
import type { TCoverageIssue, TDistribution, TGroupSummary, TPairResult } from "./benchmark.type";

const formatMs = (ms: number) => ms.toFixed(MS_DECIMALS);
const formatOptional = (value: number | null, format: (value: number) => string) =>
  value === null ? "n/a" : format(value);
const toPercent = (share: number) => (share * 100).toFixed(PERCENT_DECIMALS);
const formatPercent = (share: number) => `${toPercent(share)}%`;
const formatKb = (bytes: number) => (bytes / BYTES_PER_KB).toFixed(MS_DECIMALS);

function csvField(value: string | number | boolean | null): string {
  const text = value === null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(pairs: TPairResult[]): string {
  const rows = pairs.flatMap((pair) =>
    (["cold", "warm"] as const).map((phase) => {
      const m = pair[phase];
      return [
        pair.run,
        pair.file,
        pair.endpoint,
        pair.grid,
        pair.url,
        phase,
        m.status,
        formatMs(m.ms),
        m.xCache,
        m.serverTiming,
        m.upstreamMs,
        m.bytes,
        m.bindings,
        m.periods.join(" "),
        m.variables.join(" "),
        pair.place,
        pair.isPredictedBypass,
        pair.reason === null,
        pair.exclusion,
        pair.reason,
      ]
        .map(csvField)
        .join(",");
    }),
  );
  return [CSV_COLUMNS.join(","), ...rows].join("\n") + "\n";
}

const rowName = (summary: TGroupSummary) =>
  summary.grid === null ? summary.endpoint : `${summary.endpoint} @ ${summary.grid}`;

export function formatSummary(summary: TGroupSummary): string {
  const dist = (d: TDistribution | null) =>
    d ? `median ${formatMs(d.median)} ms, p95 ${formatMs(d.p95)} ms` : "n/a";
  return [
    `${summary.file} · ${rowName(summary)}: ${summary.validPairs} of ${summary.totalPairs} pairs valid (cold MISS → warm HIT)`,
    `  excluded  ${summary.excludedNearEdge} near a cell edge (BYPASS), ${summary.excludedNoData} no data, ${summary.excludedError} error, ${summary.excludedOther} other; ${summary.bypassMismatches} BYPASS not as the app's edge rule predicts`,
    `  uncached  ${dist(summary.cold)}`,
    `  cached    ${dist(summary.warm)}`,
    `  speed-up  ${formatOptional(summary.speedUp, (value) => `${value.toFixed(MS_DECIMALS)}×`)} (median uncached / median cached)`,
    `  upstream  median ${formatOptional(summary.upstreamMedianMs, formatMs)} ms, ${formatOptional(summary.upstreamShareMedian, formatPercent)} of the uncached request (Server-Timing)`,
    `  response  median ${formatOptional(summary.bytesMedian, formatKb)} kB, ${formatOptional(summary.bindingsMedian, String)} bindings, periods: ${summary.periods.join(", ") || "none"}`,
  ].join("\n");
}

/** One line per city whose SCRAPI answer was empty or incomplete */
export function formatCoverageIssue(issue: TCoverageIssue): string {
  const bindings = issue.bindings.map((count) => count ?? "none").join("/");
  const missing = [
    issue.missingVariables.length > 0 ? `variables ${issue.missingVariables.join(", ")}` : "",
    issue.missingPeriods.length > 0 ? `periods ${issue.missingPeriods.join(", ")}` : "",
  ].filter(Boolean);
  return `  ${issue.place} · ${issue.endpoint}${issue.grid === null ? "" : ` @ ${issue.grid}`}: status ${[...new Set(issue.statuses)].join("/")}, ${bindings} of ${issue.expectedBindings} bindings per run${missing.length > 0 ? `; missing ${missing.join("; ")}` : ""}`;
}

const LATEX_SPECIALS: Record<string, string> = {
  "\\": "\\textbackslash{}",
  "&": "\\&",
  "%": "\\%",
  $: "\\$",
  "#": "\\#",
  _: "\\_",
  "{": "\\{",
  "}": "\\}",
  "~": "\\textasciitilde{}",
  "^": "\\textasciicircum{}",
};

export const latexEscape = (text: string) =>
  text.replace(/[\\&%$#_{}~^]/g, (char) => LATEX_SPECIALS[char] ?? char);

const latexGrid = (grid: string | null) =>
  grid === null ? NO_GRID_LABEL : (GRID_LATEX_LABELS[grid] ?? latexEscape(grid));
const latexMs = (d: TDistribution | null) =>
  d ? [formatMs(d.median), formatMs(d.p95)] : ["--", "--"];
const latexOptional = (value: number | null, format: (value: number) => string) =>
  value === null ? "--" : format(value);

function timingRow(summary: TGroupSummary): string {
  return [
    latexEscape(summary.endpoint),
    latexGrid(summary.grid),
    String(summary.validPairs),
    String(summary.excludedNearEdge),
    String(summary.excludedNoData),
    String(summary.excludedError),
    String(summary.excludedOther),
    ...latexMs(summary.cold),
    ...latexMs(summary.warm),
    latexOptional(summary.speedUp, (value) => `${value.toFixed(MS_DECIMALS)}$\\times$`),
    latexOptional(summary.upstreamShareMedian, (share) => `${toPercent(share)}\\%`),
  ].join(" & ");
}

function payloadRow(summary: TGroupSummary): string {
  return [
    latexEscape(summary.endpoint),
    latexGrid(summary.grid),
    latexOptional(summary.bytesMedian, formatKb),
    latexOptional(summary.bindingsMedian, String),
    String(summary.periods.length),
  ].join(" & ");
}

const rows = (summaries: TGroupSummary[], row: (summary: TGroupSummary) => string) =>
  summaries.map((summary) => `${row(summary)} \\\\`);

/**
 * Two booktabs tables to paste into the paper: the timings per endpoint and resolution (median
 * and p95 uncached and cached, speed-up, the upstream call's share), and what each answered.
 */
export function toLatex(summaries: TGroupSummary[], runs: number): string {
  return [
    "% requires \\usepackage{booktabs}",
    "\\begin{table*}[t]",
    "\\centering",
    "\\small",
    `\\caption{API response times in ms over ${runs} runs: uncached (Redis miss, upstream call) and cached (Redis hit). $n$: valid pairs. Excluded pairs by reason: Edge, the point lies within $5\\cdot10^{-4}$\\textdegree{} of a cell edge (not cached); No data, the cell has no data (an empty answer, never cached); Error, a failed request; Other, any other unexpected cache state. Upstream: median share of the uncached response time spent in the upstream call (Server-Timing).}`,
    "\\label{tab:api-benchmark}",
    "\\begin{tabular}{llrrrrrrrrrrr}",
    "\\toprule",
    " & & & \\multicolumn{4}{c}{Excluded} & \\multicolumn{2}{c}{Uncached} & \\multicolumn{2}{c}{Cached} & & \\\\",
    "\\cmidrule(lr){4-7}\\cmidrule(lr){8-9}\\cmidrule(lr){10-11}",
    "Endpoint & Res. & $n$ & Edge & No data & Error & Other & Median & p95 & Median & p95 & Speed-up & Upstream \\\\",
    "\\midrule",
    ...rows(summaries, timingRow),
    "\\bottomrule",
    "\\end{tabular}",
    "\\end{table*}",
    "",
    "\\begin{table}[t]",
    "\\centering",
    "\\caption{What each endpoint answered (uncached responses, medians): response size, SPARQL bindings, and the climate periods the bindings cover.}",
    "\\label{tab:api-benchmark-payload}",
    "\\begin{tabular}{llrrr}",
    "\\toprule",
    "Endpoint & Res. & Size (kB) & Bindings & Periods \\\\",
    "\\midrule",
    ...rows(summaries, payloadRow),
    "\\bottomrule",
    "\\end{tabular}",
    "\\end{table}",
    "",
  ].join("\n");
}
