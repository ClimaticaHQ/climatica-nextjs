# Charts

How a chart page's chart is built: the series a page hands over, the model derived from them,
and the chart section that draws it. Every chart page goes through these; the page side is in
[pages.md](pages.md).

## Series

A chart draws a list of [`TChartSeries`](../src/types/charts/series.type.ts): one monthly
dataset each — a city, a climate period or a weather year — with its label, its context line,
its colour, its altitude and its own data state (weather years load one by one).

| Page                      | Series                                   | Kind            |
| ------------------------- | ---------------------------------------- | --------------- |
| City Climate              | one city                                 | `city`          |
| Compare Cities            | two cities, A and B                      | `city`          |
| Compare Periods (Climate) | two climate periods of one city, A and B | `climatePeriod` |
| Compare Periods (Weather) | 2–5 weather years of one city            | `weatherYear`   |

What a kind always means is in [`SERIES_KIND_RULES`](../src/constants/series.constant.ts):

| Rule             | `city`        | `climatePeriod` | `weatherYear` |
| ---------------- | ------------- | --------------- | ------------- |
| `canShade`       | yes           | yes             | no            |
| `titleSource`    | series labels | the page        | the page      |
| `isSingleYear`   | no            | no              | yes           |
| `hasSeriesChips` | no            | no              | yes           |
| `hasMeanLine`    | yes           | yes             | no            |
| `usesOwnColor`   | no (A / B)    | no (A / B)      | yes           |

The chart decides from these rules and the page's features — never from the page or the
number of series.

## Model

[`deriveChartModel`](../src/utils/chartModel.util.ts) (through
[`useChartModel`](../src/hooks/charts/useChartModel.ts), which adds the translated texts)
derives, per series, the months with their mean temperature, the aridity, the annual summary
(null while a month is missing), the stats and the Walter-Lieth series; and, shared by all,
the scales, the precipitation axis' top and the Walter-Lieth domain. The page's hook derives
it once; the chart card, the stats table and the export all draw from it.

## View state and features

A page also hands over:

- **View state** (`TChartViewState`, from the URL): chart mode, layout, shading, the expanded
  panel, the side-by-side pair, the series shown in the overlay, the variable filter and the
  month filter. An absent part isn't offered (no layout: no layout switch).
- **Features** (`TChartFeatures`, what the page enables): the title text, the stats table's
  difference (`minuendId`, and `meaning` — `EDifferenceMeaning`, cities or periods — which picks
  the header popover's wording), side pickers, the month badge, the raw export, and the chart
  blocks it leaves out (`hiddenBlocks`).

Both types are in [`chartPage.type.ts`](../src/types/charts/chartPage.type.ts).

## Chart section and card

[`ChartSection`](../src/components/charts/ChartSection.tsx) — the only export of
`components/charts` — draws the export menu, the blocks above the card, and the chart card;
their skeletons while loading. Empty and error messages are the page layout's.

[`ChartCard`](../src/components/charts/ChartCard.tsx) draws the header
([`ChartCardHeader`](../src/components/charts/ChartCardHeader.tsx): title, chart type and
layout switches, the controls row) and the body for the layout
([`resolveChartBody`](../src/components/charts/charts.util.ts)), crossfading when the chart
type, layout or data changes:

| Body                                                      | When                   | Draws                                                                                           |
| --------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------- |
| [`SingleBody`](../src/components/charts/SingleBody.tsx)   | no layout (one series) | one Walter-Lieth diagram or standard chart                                                      |
| [`SplitBody`](../src/components/charts/SplitBody.tsx)     | side by side           | two panels, each expandable; with side pickers each panel picks its series, a swap between them |
| [`OverlayBody`](../src/components/charts/OverlayBody.tsx) | overlay                | every drawn series in one chart; series chips above for kinds that have them                    |

Every standard chart with several series is one
[`StandardChart`](../src/components/charts/StandardChart.tsx); every Walter-Lieth overlay is
one [`WalterLiethOverlay`](../src/components/charts/WalterLiethOverlay.tsx). A Walter-Lieth
overlay of a shadable pair needs both series complete; otherwise the side by side shows the
diagram next to the other's notice.

## Inside the card

### Standard chart

The standard chart is a Recharts `ComposedChart` with two y axes
([`StandardChartAxes`](../src/components/charts/StandardChartAxes.tsx)): °C on the left, on the
model's `scales` (rounded outward to 5 °C), and mm on the right from 0 to `rightMax` (the
wettest month rounded up to 10 mm, 100 mm without data). Unlike the Walter-Lieth diagram the two
axes aren't tied to each other.

- **One series** ([`StandardClimateChart`](../src/components/charts/StandardClimateChart.tsx)):
  precipitation bars coloured by the month's aridity (arid or humid, `CHART_COLORS`), and the
  max, mean and min temperature lines in the variable colours.
- **Several series** ([`StandardChart`](../src/components/charts/StandardChart.tsx)): per series
  its bars side by side in its bar colour, and its lines in its line colour. Line style tells the
  variables apart: max solid, mean dashed, min dotted (`CHART_LINE_DASH` in
  [`legend.constant.ts`](../src/constants/legend.constant.ts)). Kinds without `hasMeanLine`
  (weather years) draw no mean line.
- **Variable chips** ([`VariableChips`](../src/components/charts/VariableChips.tsx)) toggle max,
  mean, min and precipitation. They start from the variables filter and follow it
  ([`useVisibleSeries`](../src/hooks/charts/useVisibleSeries.ts)); the last one on stays on
  (locked). A toggled series fades over `MOTION.CHART_SERIES_TOGGLE_MS`.
- **Month filter.** Months outside the filter are dimmed, not removed, so the year's shape
  stays readable.

The Walter-Lieth diagram's own rules (scale, regimes, frost band, when it's drawn) are in
[climate-indices.md](climate-indices.md).

### Overlay and side by side

- **Overlay** ([`OverlayChart`](../src/components/charts/OverlayChart.tsx)): every drawn series
  in one chart on shared scales. For weather years, series chips
  ([`SeriesChips`](../src/components/charts/SeriesChips.tsx)) above the chart toggle a year
  (the URL's `shownYears`) and highlight it on hover or focus: the other series dim to
  `OVERLAY_DIM_OPACITY`. A year turned off keeps its place and colour.
- **Side by side** ([`SplitBody`](../src/components/charts/SplitBody.tsx),
  [`SplitPanels`](../src/components/SplitPanels/SplitPanels.tsx)): two panels on the same
  scales or Walter-Lieth domain, so they compare at a glance. The pair is the page's (with more
  than two weather years, picked with the side pickers: the URL's `pair`) or the first two series
  (`getSplitPair`).
- **Expand.** Each panel's header has an expand button: the expanded panel fills the card,
  its plot as tall as in the split and on the same shared domain, with a switch to the other
  series and "Show both". The state is the URL's `expanded`. A Walter-Lieth panel can expand
  only when its series is complete. Exports draw only the expanded panel's chart, but the full
  stats table ([export.md](export.md)).

### Hover sync

The hovered month is one state per card: `activeMonthIndex` in
[`ChartCard`](../src/components/charts/ChartCard.tsx), passed down to every chart, panel and
monthly values table it holds. Hovering or focusing a month anywhere in the card highlights it
everywhere: a band in `--color-state-hover` on each plot, its dots standing out, the other months'
bars dimmed to `STANDARD_CHART_HOVER_DIMMED_BAR_OPACITY` (35%), and its column in the values
table. The card's charts also share one Recharts `syncId`, so both split panels show their
tooltip for the same month.

### Tooltips

Every tooltip writes values in the text colour; the series shows by its marker or swatch, never
by coloured small text ([colors.md](colors.md#text-in-a-series-colour)).

| Tooltip                                                                                      | Chart                    | Shows                                                                                                             |
| -------------------------------------------------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| [`StandardTooltip`](../src/components/charts/StandardTooltip.tsx)                            | standard                 | the month, then each drawn line and bar: its series marker (several series) or its variable's legend swatch (one) |
| [`WalterLiethTooltip`](../src/components/WalterLiethChart/components/WalterLiethTooltip.tsx) | one Walter-Lieth diagram | the month's temperature and precipitation and its period, after their legend swatches                             |
| [`OverlayTooltip`](../src/components/charts/OverlayTooltip.tsx)                              | Walter-Lieth overlay     | per series its marker and name, then its values                                                                   |

### Monthly values table

[`MonthlyValuesTable`](../src/components/MonthlyValuesTable/MonthlyValuesTable.tsx), the
`VALUES_TABLE` block, shows each month's mean temperature and precipitation under every chart,
one column exactly under each month of the plot (in an overlay, each series' value stacked, with
its marker beside the unit). Its layout follows the width the chart gives it, not the viewport
(a container query): below 30rem — a phone, a split panel — twelve columns can't fit a value
each, so a disclosure reveals a vertical table instead. It has no row hover: it highlights the
hovered month's column, in step with the chart. The export draws the same rows
(`buildMonthlyValuesRows`).

## Chart blocks

Everything drawn under or around a chart is a block in the registry `CHART_BLOCKS` in
[`ChartBlocks.tsx`](../src/components/charts/ChartBlocks.tsx), typed with
`satisfies Record<EChartBlock, …>` so every `EChartBlock` member needs an entry:

| Block          | Placement | Where                                                                   |
| -------------- | --------- | ----------------------------------------------------------------------- |
| `VALUES_TABLE` | `PANEL`   | under every chart: each split panel gets its own                        |
| `LEGEND`       | `BODY`    | once under the body: split panels share it                              |
| `STATS_TABLE`  | `SECTION` | above the chart card, in the chart section (with the difference column) |

Every body places `<ChartBlocks>` for its spots; none renders a block itself. A `PANEL` or
`BODY` block gets the block context (`TChartBlockContext`: the chart mode, the body, the
kind's rules, the series drawn there, the variable chips, the hovered month, whether it's
compact, the shaded series, the panel shown); a `SECTION` block gets the
whole model and the page's features. A page leaves a block out through `hiddenBlocks` (City
Climate: the stats table — its stat cards and the chart's stats bar say the same).

The stats table's header ([`StatsTableHead`](../src/components/charts/StatsTableHead.tsx))
bottom-aligns every title on one line height. Its Difference title carries an info popover
explaining the formula and sign from the pair's labels (`DIFFERENCE_NOTE_KEYS` by `meaning`). A
series name stays on one line; only when it's clipped
([`useIsTruncated`](../src/hooks/ui/useIsTruncated.ts)) does it become a popover trigger showing
the full name.

A hovered body row takes the hover state layer (`--color-state-hover`, `STATS_TABLE_CLASSES.ROW`):
an inset shadow on each cell, so the pinned metric cell tints over its opaque background. It
fades over `MOTION.STATE_HOVER_MS` (off with the Animations setting and under reduced motion),
only where the device can hover (Tailwind's `hover:`), and keeps the default cursor: rows aren't
clickable. The monthly values table has no row hover: it highlights the hovered month's column.

### Adding a block under every chart

1. Add a member to `EChartBlock` in [`chart.enum.ts`](../src/enums/chart.enum.ts).
2. Write its component in `ChartBlocks.tsx` (`TChartBlockProps` for under a chart,
   `TSectionBlockProps` above the card), reading only the context or the model.
3. Add its entry, with its placement, to `CHART_BLOCKS` — the build fails until you do.

It then appears under every chart of every page, in every layout and both chart types. A page
that shouldn't show it adds it to its `hiddenBlocks`. The exports have their own builders
(below): a block that belongs in the exported image is added there too.

## Exports

The export menu comes from [`useSingleChartExport`](../src/hooks/charts/useSingleChartExport.ts)
(one series: CSV of the monthly values, PNG / SVG, and the raw CSV / JSON where the page offers
it) or [`useComparisonChartExport`](../src/hooks/charts/useComparisonChartExport.ts)
(compared series: CSV of their stats, PNG / SVG titled like the chart and named after the
page's place and the exported series). Both build from the same model and stats table as the
screen and follow it — chart type, layout, shading, expanded panel or drawn years, chips. The
SVG builders are in [`src/utils/export/svg/`](../src/utils/export/svg); a PNG is that SVG
rasterized, so the two never differ. Exports read colours from the light palette in either
theme, and every `var(--token)` in the SVG is replaced by its value before it is saved
([colors.md](colors.md)). Both menus are disabled while data is being replaced. The whole
pipeline — builders, token resolution, PNG rendering, the heat map's tiles — is in
[export.md](export.md).

## Data updates

The page's `update` (series data by key, whether it's fetching, the announcement) goes to the
[`DataUpdateProvider`](../src/components/DataUpdate/DataUpdateProvider.tsx) around the results.
New data replacing shown data is an update — a first load or an unchanged refetch isn't. A card
flashes when an update changed one of its series (`flashKeys`), the chart card dims and its
progress bar runs while an update takes longer than `MOTION.UPDATE_LOADING_DELAY_MS`, and
each update is announced once in a polite live region. Split panels flash on their own.
