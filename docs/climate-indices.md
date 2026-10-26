# Walter-Lieth and climate indices

The climate science the app computes: the Walter-Lieth diagram's geometry and the derived values
(mean temperature, arid and frost months, De Martonne). All of it is pure code in
[`src/utils/`](../src/utils), shared by the screen and the exports, so a file never disagrees with
the page. Chart assembly is in [charts.md](charts.md).

## Input

Every series is twelve rows of `tmax`, `tmin`, `prec`
(`buildMonthlyTemperaturesFromPointValues`, [`worldclim.util.ts`](../src/utils/worldclim.util.ts)).
A missing value stays `null`, never 0 — 0 °C and 0 mm are real data. The mean is derived:
`tavg = (tmin + tmax) / 2` ([`getMonthlyMean`](../src/utils/monthlyClimate.util.ts)). Statistics
over a gap return `null` (`allPresent`, `sumOf`, `meanOf`) and show "—".

## The Walter-Lieth diagram

Mean temperature and precipitation on one shared vertical axis
([`walterLieth.util.ts`](../src/utils/walterLieth.util.ts), `WALTER_LIETH_DIAGRAM`).

### Scale

- **10 °C = 20 mm** up to 100 mm, so the curves meet where `P = 2T`.
- **Above 100 mm**, precipitation is compressed 1:10, or a monsoon month would make the plot
  several times taller than its temperature range (`toPrecipAxisValue` / `fromPrecipAxisValue`).
- **Ticks:** °C every 5 (every 10 past a 30 °C range) plus the scale's top; mm every 20 up to 100,
  then at most three round steps, since compressed ticks would overlap.
- **Months:** each at the centre of its band, x domain `[-0.5, 11.5]`, January to December.

### Domain

[`getSharedDomain`](../src/utils/walterLieth.util.ts) computes one domain for every series of a
chart — compared diagrams must share axes. `tempMin` is never above 0 (the 0 °C and 0 mm baselines
coincide); `tempMax` and `precMax` round outward; `plotMax` is the larger, and when precipitation
sets it a dashed line marks the top of the °C scale.

The standard chart's scales (`getWalterLiethScales`) widen for precipitation only when it exceeds
2.2 × `tempMax`: a ratio near 2 is the convention's baseline, so typical climates keep their
temperature curve at full height.

### Regimes

| Regime   | Condition                                     | Drawn as       |
| -------- | --------------------------------------------- | -------------- |
| arid     | precipitation below temperature               | dots           |
| humid    | precipitation above temperature, up to 100 mm | vertical lines |
| perhumid | precipitation above 100 mm                    | solid fill     |

[`getAridHumidSegments`](../src/utils/walterLieth.util.ts) splits the year at every month and at
every crossing of the temperature curve, the precipitation curve and the 100 mm line (linear
interpolation, `getBreakpoints`), so an arid season starts where the curves actually meet. Hatch
spacing follows the month width (`getHatchGeometry`), so panels, full charts and exports hatch
alike. A month is arid when `P < 2T` (`isAridMonth`; exactly `P = 2T` is humid).

### Frost band

Under the x axis, a month's cell is filled when its mean minimum is below 0 °C — the convention's
"certain frost". "Probable frost" needs absolute minima, which WorldClim doesn't provide. A month
without a minimum is neutral (`getFrostMonths`). The band's height is reserved under every plot,
standard charts included, so switching chart type never resizes the plot.

### When the diagram is drawn

- **Complete data only:** all 12 months need mean temperature and precipitation
  (`toWalterLiethMonths`); otherwise a notice (`WalterLiethIncompleteNotice`). A single chart's
  export is then disabled; a comparison export draws the notice in that panel.
- **Single years:** the diagram reads a long-term average year. A Weather year is labelled
  "single year" (`isSingleYear`) and its Martonne index "per year", so it isn't read as the
  place's climate.
- **Filters:** the diagram always plots mean temperature and precipitation for every month, so
  the variables and months filters are disabled in Walter-Lieth ([filters.md](filters.md)).

### Overlay

Several series share the domain, all in the diagram's colours; each series' dots take its shape,
and line style tells the variables apart. Only the shaded series (`wlShading`, default A) is
hatched; it's drawn first so its fill never covers another's curves (`orderShadedFirst`), with a
translucent perhumid fill and its frost band. Weather years can't be shaded.

## Climate indices

[`getAnnualSummary`](../src/utils/walterLieth.util.ts) is the one implementation of the annual
values (stats bars, stats table, regional profile, exports); it needs complete months.

| Value                    | Formula                                | Where                 |
| ------------------------ | -------------------------------------- | --------------------- |
| Mean temperature `T`     | mean of the monthly `tavg`             | `getAnnualSummary`    |
| Annual precipitation `P` | sum of the months, rounded to mm       | `getAnnualSummary`    |
| Avg max / avg min        | mean of `tmax` / `tmin`                | `computeCompareStats` |
| Arid months              | months with `P < 2T`                   | `getAnnualSummary`    |
| Frost months             | months with mean minimum below 0 °C    | `countFrostMonths`    |
| De Martonne `M`          | `P / (T + 10)`; none when `T + 10 ≤ 0` | `getAnnualSummary`    |
| Altitude                 | the WorldClim cell's elevation         | `useGetAltitude`      |

Arid and frost months use the diagram's own rules on purpose: a count beside the diagram must
agree with its dots and frost cells.

### De Martonne classes

[`getMartonneBadge`](../src/utils/martonne.util.ts) classifies the index (`MARTONNE_CLASSES`):

| `M`   | below 10 | 10–20     | 20–24         | 24–28      | 28–35 | 35–55      | above 55        |
| ----- | -------- | --------- | ------------- | ---------- | ----- | ---------- | --------------- |
| Class | Arid     | Semi-arid | Mediterranean | Semi-humid | Humid | Very humid | Extremely humid |

The stats bar's tooltip lists the classes from the same constant (`buildMartonneTooltip`), so it
can't disagree with the badges.

### Other values

- **City Climate's stat cards** follow the months filter (`computeClimateStats`); in Walter-Lieth
  they cover every month, as the diagram does.
- **Differences** (the stats table): minuend minus the other series — B − A for cities, later minus
  earlier for periods; a missing side leaves it out (`buildStatsTable`).
- **Heat map** stats are about cells, not months ([heat-map.md](heat-map.md#statistics)).

## Adding a derived value

1. A pure function over the twelve months, returning `null` when a month it needs is missing.
2. For the stats table: a `TComparisonMetric`, its row in `COMPARISON_METRICS`, its label key, and
   its value in `getMetricValues` ([`comparisonTable.constant.ts`](../src/constants/comparisonTable.constant.ts));
   the page and both exports read the same rows.
3. Labels in all 10 locales; tests beside [`walterLieth.test.ts`](../tests/unit/utils/walterLieth.test.ts).
