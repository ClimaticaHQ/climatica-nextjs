# Pages

How a page is built: its route, its hook, its view and the shared layout every page uses.
The chart a chart page shows is in [charts.md](charts.md); URL state in
[url-state.md](url-state.md); filters in [filters.md](filters.md).

## Three layers

| Layer        | Where                                                                    | Job                                                                                                                                                                    |
| ------------ | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page hook    | [`src/hooks/pages/`](../src/hooks/pages)                                 | Everything that differs between pages: URL state, data, the series, the page's features, its data state, update, export menu, summary and details. Returns one object. |
| Model        | [`deriveChartModel`](../src/utils/chartModel.util.ts) (chart pages only) | Everything a chart draws, derived from the series. Pure: no React. See [charts.md](charts.md).                                                                         |
| Presentation | [`PageLayout`](../src/components/page/PageLayout.tsx) and the page view  | The page's frame, the same for every page, filled by a short view.                                                                                                     |

A page's container is one line: it calls the hook and passes the result to its view.

```tsx
export function CompareCities() {
  return <CompareCitiesView page={useCompareCitiesPage()} />;
}
```

The view only places blocks in the layout's regions; it fetches nothing and holds no state.

## The four pages

| Page                                 | Hook                                                                   | Controls                                    | Summary                   | Main          | Details               |
| ------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------- | ------------------------- | ------------- | --------------------- |
| City Climate (`/climate-statistics`) | [`useCityClimatePage`](../src/hooks/pages/useCityClimatePage.ts)       | search, filter bar (and the map below them) | stat cards (month filter) | chart section | —                     |
| Compare Cities (`/compare-cities`)   | [`useCompareCitiesPage`](../src/hooks/pages/useCompareCitiesPage.ts)   | two searches with a mini map, filter bar    | —                         | chart section | difference cards      |
| Compare Periods (`/compare-periods`) | [`useComparePeriodsPage`](../src/hooks/pages/useComparePeriodsPage.ts) | search with a mini map, filter bar, periods | —                         | chart section | trend cards (Climate) |
| Region Heatmap (`/heat-map`)         | [`useHeatMapPage`](../src/hooks/pages/useHeatMapPage.ts)               | search, filter bar, drawing tools           | the region's stats        | the map       | regional profile      |

- **Compare Periods** has two datasets with their own hooks:
  [`useClimatePeriodsChart`](../src/hooks/pages/useClimatePeriodsChart.ts) (periods A and B,
  difference later − earlier) and [`useWeatherYearsChart`](../src/hooks/pages/useWeatherYearsChart.ts)
  (2–5 weather years, each loading on its own). The page hook picks one and adds what both
  share: the city, the URL, the view state.
- **Region Heatmap** has no series. Its hook returns the props of its blocks
  (`THeatMapPage`): the region and drawing tools
  ([`useHeatMapSelection`](../src/hooks/pages/useHeatMapSelection.ts)), the exports
  ([`useHeatMapExport`](../src/hooks/pages/useHeatMapExport.ts)) and the cell cap
  ([`useTooManyCellsMessage`](../src/hooks/pages/useTooManyCellsMessage.ts); see
  [backend.md](backend.md) for why regions are capped). The page is described in
  [heat-map.md](heat-map.md).

## PageLayout

[`PageLayout`](../src/components/page/PageLayout.tsx) draws every page in one order:

1. **Header** — [`PageHeader`](../src/components/PageHeader/PageHeader.tsx): the page's title
   (the navbar's name for it) and description.
2. **Controls** — what the reader picks with: searches, mini maps, the filter bar, Compare
   Periods' periods, the heat map's drawing tools.
3. **Map** (optional) — a map to pick a place on (City Climate).
4. **Status** — the results' empty or error message
   ([`PageStatus`](../src/components/page/PageStatus.tsx), through
   [`StatusMessage`](../src/components/UI/StatusMessage/StatusMessage.tsx)); nothing while
   loading or ready.
5. **Results** — summary, main content, details. Inside the
   [`DataUpdateProvider`](../src/components/DataUpdate/DataUpdateProvider.tsx) when the page
   passes `update`, so its cards flash and the update is announced.

Spacing comes from tokens in [`tokens.css`](../src/styles/tokens.css):

| Token                   | Between                                       |
| ----------------------- | --------------------------------------------- |
| `--page-gap`            | the page's regions                            |
| `--page-controls-gap`   | the controls                                  |
| `--page-results-gap`    | the summary, the main content and the details |
| `--section-gap`         | a chart section's summary and its card        |
| `--section-toolbar-gap` | the export row and the chart section below it |

Controls and data state are optional: the settings page passes only its main content, with no
filters and no data.

The details sit a full `--page-gap` below the main content. The results region is laid out
only while it draws something, so an empty or failed result leaves no gap.

## Data state and errors

A page's data state is a `TDataState`
([`resolveDataState`](../src/utils/dataState.util.ts)): loading, then an error, then empty,
else ready. An empty state carries a list of messages, one line each (Compare Periods names
each period without data). An error carries the error itself: the reader sees the translated
message for its cause ([`getErrorMessageKey`](../src/utils/apiError.util.ts), through
[`useErrorMessage`](../src/hooks/pages/useErrorMessage.ts)), never its text.

## Shared page hooks

In [`src/hooks/pages/`](../src/hooks/pages), used by several pages:

| Hook                                                                     | Does                                                                                                                  |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| [`useCitySelection`](../src/hooks/pages/useCitySelection.ts)             | Picks a city into a slot; with sync on, the slots that follow it take it and their pages refetch (`CITY_SLOT_RULES`). |
| [`useMapPointSelection`](../src/hooks/pages/useMapPointSelection.ts)     | A click on the map: selected at once under its coordinates, renamed when the place lookup answers.                    |
| [`useScrollToResults`](../src/hooks/pages/useScrollToResults.ts)         | Scrolls to the results once a picked city's data shows (setting: auto-scroll).                                        |
| [`useDocumentTitle`](../src/hooks/pages/useDocumentTitle.ts)             | The tab's title: the place(s) and details, or the page's name until they're known.                                    |
| [`useNoPeriodDataMessage`](../src/hooks/pages/useNoPeriodDataMessage.ts) | "No data for {period} at {grid}" in the page's wording.                                                               |
| [`useErrorMessage`](../src/hooks/pages/useErrorMessage.ts)               | An error's translated message.                                                                                        |

## Adding a block on every page

A block every page shows belongs to `PageLayout`, added once:

1. Add its region (a prop) to `TPageLayoutProps` in
   [`page.type.ts`](../src/components/page/page.type.ts) and render it in its place in
   `PageLayout`; its spacing goes in [`page.constant.ts`](../src/components/page/page.constant.ts)
   from the `--page-*` tokens.
2. If its content comes from the page, make it a required field of the page hooks' results
   (`TChartPageResult` in [`chartPage.type.ts`](../src/types/charts/chartPage.type.ts) and
   `THeatMapPage`): the build then fails on every page until each provides it.
3. Pass it from each view (four files, one line each).

A block under every chart is a chart block instead — see [charts.md](charts.md).

## Adding a chart page

1. **Route**: `src/app/<page>/page.tsx` — render the container in `Suspense`, export
   `generateMetadata = createPageMetadata(resolver, route)` (a resolver in
   [`metadata.util.ts`](../src/utils/metadata.util.ts)). Add the route to
   [`ROUTES`](../src/constants/route.constant.ts) and a link to
   [`NAV_LINKS`](../src/constants/navlink.constant.ts).
2. **Filters**: an `EFilterView` member, its entry in `FILTER_VIEW_BY_ROUTE`, and which filters
   it shows ([filters.md](filters.md)).
3. **URL state**: the page's schema in its `<Page>.constant.ts`, and its entry in
   [`REMEMBERED_PAGE_PARAMS`](../src/constants/pageParams.constant.ts) for the navbar links
   ([url-state.md](url-state.md)).
4. **Hook**: `use<Page>Page` in `src/hooks/pages/`, returning `TChartPageResult`: build the
   series (a new kind of series needs its `SERIES_KIND_RULES` entry — see
   [charts.md](charts.md)), pass them through `useChartModel`, set the view state and
   features, the data state, the update and the export menu.
5. **Container and view**: `src/app/<page>/_components/` — the one-line container, and a
   view filling `PageLayout` with the controls and `<ChartSection chart={page} />`.
6. **Texts**: `pages.<page>.title` and `.description` in all 10 locales ([localization-i18n.md](localization-i18n.md)).
7. **Tests**: a page test through its hook (see
   [`compareCitiesPage.test.tsx`](../tests/unit/app/compareCitiesPage.test.tsx)) and an
   E2E test loading it from a URL ([testing.md](testing.md)).
