# Walter-Lieth and climate indices

The climate science the app computes: the Walter-Lieth diagram's geometry and rules, and the
derived values every page shows (mean temperature, arid and frost months, the De Martonne
index). Everything here is pure code in [`src/utils/`](../src/utils), shared by the screen and
the exports, so a PNG never disagrees with the page. How the chart is assembled is in
[charts.md](charts.md); the diagram's colours in [colors.md](colors.md).

## Input: twelve monthly values

Every series is twelve rows of `tmax`, `tmin` and `prec` (`TMonthlyTemperature`), built from
WorldClim's point values by `buildMonthlyTemperaturesFromPointValues`
([`worldclim.util.ts`](../src/utils/worldclim.util.ts)). A value the response lacks stays
`null`, never 0: 0 °C and 0 mm are real data.

The mean monthly temperature is derived, not fetched: `tavg = (tmin + tmax) / 2`, or `null`
when either is missing ([`getMonthlyMean`](../src/utils/monthlyClimate.util.ts)).

A statistic over a gap would be silently wrong, so the helpers in
[`monthlyClimate.util.ts`](../src/utils/monthlyClimate.util.ts) (`allPresent`, `sumOf`,
`meanOf`) return `null` when any month is missing. The page then shows "—" for that value.

## The Walter-Lieth diagram

The diagram plots each month's mean temperature and precipitation on one shared vertical axis,
so the area between the two curves shows the dry and wet seasons at a glance. The rules are in
[`walterLieth.util.ts`](../src/utils/walterLieth.util.ts), the numbers in
`WALTER_LIETH_DIAGRAM` ([`walterLieth.constant.ts`](../src/constants/walterLieth.constant.ts)).

### Scale

- **10 °C = 20 mm.** Up to 100 mm, precipitation is drawn at 2 mm per °C (`LINEAR_RATIO`), so
  the temperature curve and the precipitation curve meet where `P = 2T`.
- **Compression above 100 mm.** Above `PREC_BREAKPOINT` (100 mm) precipitation is compressed
  1:10 (`COMPRESSION_FACTOR`): 20 mm per °C. A monsoon month would otherwise push the plot
  several times taller than its temperature range. `toPrecipAxisValue` maps mm to the shared
  axis and `fromPrecipAxisValue` maps back for tick labels.
- **Ticks.** °C every 5 °C (every 10 °C past a 30 °C range), plus the temperature scale's top
  (`getWalterLiethTempTicks`). mm every 20 mm up to 100 mm, then at most three round steps
  (`WALTER_LIETH_PREC_TICKS`): 100 mm of compressed precipitation spans only 5 °C of axis, so
  closer ticks would overlap (`getWalterLiethPrecTicks`).
- **Months.** Month `i` sits at the centre of its band; the x domain is `[-0.5, 11.5]`
  (`MONTH_EDGE_PADDING`), so screen and export place months identically. The order is always
  January to December: the geometry takes a `monthOrder` (for a southern-hemisphere July–June
  diagram), but no page passes one.

### Domain

[`getSharedDomain`](../src/utils/walterLieth.util.ts) computes one domain for every series of
a chart, because diagrams that are compared must share their axes:

- `tempMin` is the coldest mean month rounded down to 5 °C, and never above 0: the 0 °C and
  0 mm baselines coincide.
- `tempMax` is the warmest mean month rounded up to 5 °C.
- `precMax` is the wettest month on the shared axis, rounded strictly up (a month exactly on a
  step still gets headroom).
- `plotMax` is the larger of the two, so both curves fit. When precipitation sets it, a
  dashed line marks the top of the °C scale (`TEMP_MAX_REFERENCE`).

The standard chart's scales are a separate function, `getWalterLiethScales`: it widens the
plot for precipitation only when `precMax` exceeds 2.2 × `tempMax`
(`WIDEN_THRESHOLD_RATIO`). A ratio near 2 is the convention's own baseline, so a typical
climate keeps its temperature curve at full height.

### Regimes and crossings

Between the curves, each stretch of the year is one of three regimes (`EWalterLiethRegime`):

| Regime   | Condition                                        | Drawn as                     |
| -------- | ------------------------------------------------ | ---------------------------- |
| arid     | precipitation curve below the temperature curve  | dots                         |
| humid    | precipitation above temperature, up to 100 mm    | vertical lines               |
| perhumid | precipitation above 100 mm (the compressed part) | solid fill, above the 100 mm |

[`getAridHumidSegments`](../src/utils/walterLieth.util.ts) turns the twelve months into closed
polygons, one per continuous run of a regime. It splits the year at every month and at every
point where two of the three edges (temperature curve, precipitation curve, the 100 mm line)
cross, found by linear interpolation between neighbouring months in axis units
(`getBreakpoints`). Between two breakpoints no edge crosses another, so each band has one
regime. Splitting at the exact crossing, not at month boundaries, is what makes an arid season
start where the curves actually meet.

The hatching (humid lines, arid dots) is painted under the curves' halos and the perhumid fill
over them, so the precipitation line sits on the fill's edge (`partitionSegmentsByLayer`). The
hatch spacing follows the month width (`getHatchGeometry`: five lines per month, never closer
than 3 px), so a compact panel, a full chart and an export hatch alike.

A single month is arid when `P < 2T` (`isAridMonth`); exactly `P = 2T` counts as humid. This is
the same rule the arid-month count uses (below).

### Frost band

Under the x axis, one cell per month is filled when the month's mean minimum temperature is
below 0 °C (`WALTER_LIETH_FROST.THRESHOLD`; exactly 0 °C is not frost). This is the
convention's "certain frost". Its "probable frost" needs absolute minima, which WorldClim
doesn't provide, so it isn't drawn. A month without a minimum is drawn neutral (unknown)
([`getFrostMonths`](../src/utils/walterLieth.util.ts), [`getFrostBand`](../src/utils/walterLieth.util.ts)).

The band's height is reserved under every plot, standard charts included, frost or not, so
switching chart type or series never changes the plot's size.

### When the diagram is drawn

- **Complete data only.** All 12 months need a mean temperature and precipitation
  ([`toWalterLiethMonths`](../src/utils/monthlyClimate.util.ts)); a missing `tmin` alone only
  makes that frost cell unknown. An incomplete series shows a notice instead of a diagram
  (`WalterLiethIncompleteNotice`, `chart.wlIncomplete`). A single chart's export menu is then
  disabled (`exportMenu.incompleteData`); a comparison export draws the same notice in that
  panel's place (`buildNotice`).
- **Climate normals and single years.** The diagram is a reading of a long-term average year,
  which is what the Climate dataset's 30-year normals are. A Weather year is one actual year,
  so its diagram describes that year alone: its kind rule `isSingleYear`
  ([`SERIES_KIND_RULES`](../src/constants/series.constant.ts)) labels the panel "Weather ·
  single year" ([`useChartModel`](../src/hooks/charts/useChartModel.ts)), and its Martonne
  index is labelled per year. The app draws both, labelled so a single year isn't read as
  the place's climate.
- **Variables and months.** The diagram always plots mean temperature and precipitation for
  all 12 months, so the variables and months filters are disabled in Walter-Lieth mode, with
  an offer to switch to the standard chart ([filters.md](filters.md)).

### Overlay

Several series in one diagram share the domain. Colour tells the series apart, line style the
variable (solid temperature, dashed precipitation, `WALTER_LIETH_DASH.OVERLAY_PREC`). Only one
series is hatched — the shaded one, picked by the shading control (`wlShading`, default A) —
and it's drawn first so its fill never covers another series' curves (`orderShadedFirst`). Its
perhumid fill is translucent (`OVERLAY_PERHUMID_OPACITY`, 0.3), and its frost band is the one
drawn. Weather years can't be shaded (`canShade: false`).

## Climate indices

[`getAnnualSummary`](../src/utils/walterLieth.util.ts) is the one implementation of the annual
values, used by the charts' stats bars, the stats table, the regional profile and the exports.
It needs complete months (`summarizeMonths` returns `null` otherwise).

| Value                    | Formula                                                                                   | Where                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Mean temperature `T`     | mean of the 12 monthly `tavg`                                                             | `getAnnualSummary`; the stats table's `meanOf` over `tavg`                              |
| Annual precipitation `P` | sum of the 12 months, rounded to whole mm                                                 | `getAnnualSummary`; the stats table's `sumOf`                                           |
| Avg max / avg min        | mean of the 12 monthly `tmax` / `tmin`                                                    | [`computeCompareStats`](../src/utils/climateComparison.util.ts)                         |
| Arid months              | months with `P < 2T` (the Walter-Lieth rule on the mean temperature)                      | `getAnnualSummary` (`aridCount`)                                                        |
| Frost months             | months with mean minimum below 0 °C; unknown if any month lacks a minimum                 | `countFrostMonths` in [`comparisonTable.util.ts`](../src/utils/comparisonTable.util.ts) |
| De Martonne index `M`    | `P / (T + 10)` (`MARTONNE_TEMP_OFFSET`), with the rounded `P`; no value when `T + 10 ≤ 0` | `getAnnualSummary`                                                                      |
| Altitude                 | the WorldClim cell's elevation, not computed                                              | [`useGetAltitude`](../src/hooks/data/useGetAltitude.ts)                                 |

Arid and frost months use the diagram's own rules on purpose: a count beside the diagram that
disagreed with its dots and frost cells would be confusing.

### De Martonne classes

[`getMartonneBadge`](../src/utils/martonne.util.ts) classifies the index for its badge, with the
class colours and labels in [`MARTONNE_CLASSES`](../src/constants/martonne.constant.ts):

| `M`            | Class           |
| -------------- | --------------- |
| below 10       | Arid            |
| 10 to below 20 | Semi-arid       |
| 20 to below 24 | Mediterranean   |
| 24 to below 28 | Semi-humid      |
| 28 to below 35 | Humid           |
| 35 to 55       | Very humid      |
| above 55       | Extremely humid |

The stats bar's tooltip lists these classes too, built from `MARTONNE_CLASSES`
(`buildMartonneTooltip`), so the tooltip and the badges can't disagree; the locale strings hold
only the sentence before the list.

For a weather year the index describes that year alone, and its labels say so
(`chart.martonneYear`, `chart.martonnePerYear` on the stats table).

### City Climate's stat cards

City Climate's cards above the chart follow the months filter
([`computeClimateStats`](../src/app/climate-statistics/_components/ClimateStatistics.util.ts)):
the mean of `tmax` and `tmin` and the sum of `prec` over the selected months, "—" when a
selected month lacks the value. In Walter-Lieth mode they cover every month, since the diagram
does.

### Differences

The stats table's difference is minuend minus the other series, per metric
([`buildStatsTable`](../src/utils/comparisonTable.util.ts)): B − A for cities, the later period
minus the earlier for climate periods. A missing value on either side leaves the difference
out. Compare Cities' difference cards ([`computeDiffStats`](../src/utils/climateComparison.util.ts))
need complete `tmax` and precipitation for both cities, or show nothing.

### Heat map statistics

The heat map's region stats are about cells, not months: each cell's value is the mean of its
twelve monthly values, and the bar shows the cells' minimum, maximum, mean, median, standard
deviation (population) and count
([`computeHeatmapStats`](../src/app/heat-map/_components/HeatMap.util.ts)). Its regional
profile averages the region's three variables month by month (WorldClim's `avg…` queries) and
goes through `summarizeMonths` like any series. See [heat-map.md](heat-map.md).

## Adding a derived value

1. Write it as a pure function over the twelve months in
   [`walterLieth.util.ts`](../src/utils/walterLieth.util.ts) (a diagram rule) or
   [`climateComparison.util.ts`](../src/utils/climateComparison.util.ts), returning `null` when
   a month it needs is missing.
2. For the stats table: add a `TComparisonMetric`, its row to `COMPARISON_METRICS` (unit and
   decimals) and its label to `COMPARISON_METRIC_LABEL_KEYS` in
   [`comparisonTable.constant.ts`](../src/constants/comparisonTable.constant.ts), and its value
   to `getMetricValues`. The page's table and both exports read the same rows.
3. Add the label in all 10 locales ([localization-i18n.md](localization-i18n.md)) and unit tests beside
   [`walterLieth.test.ts`](../tests/unit/utils/walterLieth.test.ts).
