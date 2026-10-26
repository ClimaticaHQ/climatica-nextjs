# Pages

How a page is built: its hook, its view and the layout every page shares. Charts are in
[charts.md](charts.md), URL state in [url-state.md](url-state.md), filters in [filters.md](filters.md).

## Three layers

| Layer        | Where                                                                   | Job                                                                                               |
| ------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Page hook    | [`src/hooks/pages/`](../src/hooks/pages)                                | everything that differs between pages: URL state, data, series, features, data state, export menu |
| Model        | [`deriveChartModel`](../src/utils/chartModel.util.ts) (chart pages)     | everything a chart draws, derived from the series; pure                                           |
| Presentation | [`PageLayout`](../src/components/page/PageLayout.tsx) and the page view | the frame, the same for every page, filled by a short view                                        |

The container is one line — `<CompareCitiesView page={useCompareCitiesPage()} />`. The view only
places blocks; it fetches nothing and holds no state.

## The four pages

| Page                                 | Hook                    | Controls                                    | Summary            | Main          | Details               |
| ------------------------------------ | ----------------------- | ------------------------------------------- | ------------------ | ------------- | --------------------- |
| City Climate (`/climate-statistics`) | `useCityClimatePage`    | search, filter bar, map                     | stat cards         | chart section | —                     |
| Compare Cities (`/compare-cities`)   | `useCompareCitiesPage`  | two searches with a mini map, filter bar    | —                  | chart section | difference cards      |
| Compare Periods (`/compare-periods`) | `useComparePeriodsPage` | search with a mini map, filter bar, periods | —                  | chart section | trend cards (Climate) |
| Region Heatmap (`/heat-map`)         | `useHeatMapPage`        | search, filter bar, drawing tools           | the region's stats | the map       | regional profile      |

- **Compare Periods** picks between [`useClimatePeriodsChart`](../src/hooks/pages/useClimatePeriodsChart.ts)
  and [`useWeatherYearsChart`](../src/hooks/pages/useWeatherYearsChart.ts) by dataset, and adds
  what both share: city, URL, view state, sort order, marker slots ([charts.md](charts.md#series)).
- **Region Heatmap** has no series; see [heat-map.md](heat-map.md).

## PageLayout

[`PageLayout`](../src/components/page/PageLayout.tsx) draws, in order:

1. **Header** ([`PageHeader`](../src/components/PageHeader/PageHeader.tsx)): title and description.
2. **Controls:** searches, mini maps, the filter bar, Compare Periods' periods, drawing tools.
3. **Map** (optional, City Climate).
4. **Status:** the results' empty or error message ([`PageStatus`](../src/components/page/PageStatus.tsx));
   nothing while loading or ready.
5. **Results:** summary, main, details — inside `DataUpdateProvider` when the page passes `update`.

Spacing tokens (`tokens.css`): `--page-gap` (regions), `--page-controls-gap`, `--page-results-gap`,
`--section-gap`, `--section-toolbar-gap`. The results region is laid out only while it draws
something, so an empty or failed result leaves no gap. The settings page passes only its main
content.

## Data state and errors

`TDataState` ([`resolveDataState`](../src/utils/dataState.util.ts)): loading, then error, then
empty, else ready. Empty carries one message per line (Compare Periods names each period without
data). Errors show their cause's translated message (`useErrorMessage`), never the error's text.

## Shared page hooks

| Hook                     | Does                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `useCitySelection`       | picks a city into a slot; with `syncCity`, the following slots take it (`CITY_SLOT_RULES`) |
| `useMapPointSelection`   | a map click: selected at once by coordinates, renamed when the lookup answers              |
| `useScrollToResults`     | scrolls to the results once a picked city's data shows (`autoScroll`)                      |
| `useDocumentTitle`       | the tab title: place(s) and details                                                        |
| `useNoPeriodDataMessage` | "No data for {period} at {grid}"                                                           |
| `useErrorMessage`        | an error's translated message                                                              |

## Adding a block on every page

1. Add its prop to `TPageLayoutProps` ([`page.type.ts`](../src/components/page/page.type.ts)) and
   render it in `PageLayout`.
2. If the page provides its content, make it a required field of `TChartPageResult` and
   `THeatMapPage`, so the build fails until every page does.
3. Pass it from each view.

A block under every chart is a chart block ([charts.md](charts.md#chart-blocks)).

## Adding a chart page

1. **Route:** `src/app/<page>/page.tsx` renders the container in `Suspense` and exports
   `generateMetadata = createPageMetadata(resolver, route)`
   ([`metadata.util.ts`](../src/utils/metadata.util.ts)); add it to `ROUTES` and `NAV_LINKS`.
2. **Filters:** an `EFilterView`, its `FILTER_VIEW_BY_ROUTE` entry, its filters ([filters.md](filters.md)).
3. **URL state:** the page's schema, and its `REMEMBERED_PAGE_PARAMS` entry.
4. **Hook:** `use<Page>Page` returning `TChartPageResult` (a new series kind needs a
   `SERIES_KIND_RULES` entry).
5. **Container and view** in `src/app/<page>/_components/`, the view filling `PageLayout` with
   `<ChartSection chart={page} />`.
6. **Texts** in all 10 locales; **tests**: a page test through its hook
   ([`compareCitiesPage.test.tsx`](../tests/unit/app/compareCitiesPage.test.tsx)) and an e2e test.
