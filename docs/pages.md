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

## Info pages

About (`/about`), User guide (`/about/guide`) and Data & methods (`/about/data`): static pages,
no filters, no data requests. Components are in `src/components/info/` by role (`layout/`,
`pages/`, `parts/`, `figures/`).

- **Sections** are listed once in [`INFO_PAGES`](../src/constants/info.constant.ts); the
  navigation (sidebar from `lg`, Contents bar and sheet below) and `InfoSection` both read it.
  State is [`useInfoNavigation`](../src/hooks/pages/useInfoNavigation.ts); the section in view
  comes from `useActiveSection`.
- **Scroll spy:** the current section is the last whose top has crossed a line 30 % down
  `<main>` (`SCROLL_SPY`). Sections too near the end to reach it share the scroll left after
  the last one that can, in order; at the end the last is current
  ([`getActiveSectionIndex`](../src/utils/activeSection.util.ts)). A clicked section is marked
  at once and held until its scroll ends or the user scrolls.
- **Pages are composition-only**: shared UI and item constants from `info.constant.ts`; their
  logic is in page hooks (`useAboutFacts`, `useGuidePage`, `useDataPage`).
- **Facts come from the code** (resolutions, periods, languages, formulas, legends), never
  typed into prose. Project facts and the team are in `PROJECT_INFO` and `TEAM`; an empty value
  hides its element or section.
- **Left panel, from `lg`:** the navigation tree is in the shared
  [`SidePanel`](../src/components/UI/SidePanel/SidePanel.tsx), the filters' column, rendered by
  AppLayout on an Info route (`InfoSidePanel`) and server-rendered: present from the first paint,
  hidden below `lg` by its classes (the Contents bar is the reverse). `InfoNavigationProvider`
  around the panel and `<main>` holds the one `useInfoNavigation` (scroll spy, sheet); only the
  section in view follows on the client. A page opened on a section's hash lands there once the
  streamed page is in.
- **Footer:** each page renders `InfoFooter` last, inside its own boundary, so it streams in with
  the page and never shows above it first.
- **Widths, from `lg`:** `PageWrapper` and the shared `PageHeader` as on every page; under the
  header one centred column (`COLUMN`, `--info-column-width`, 64rem) with one left edge. Prose
  (`TEXT`, `LEAD`, `SMALL`, the lists, figure captions, `PROSE` for the questions) keeps
  `--reading-measure` (80ch); wide blocks (card grids, key facts, tables, figures, the team, the
  citation) take the column's width. The classes carry it, so a new section gets it by using
  them. Below `lg` the whole page keeps the reading measure.
- **Rhythm and sizes:** sections are 5rem apart from `lg`, 3.5rem below (the `COLUMN` gap).
  Card text and links are 15px below `lg` (the touch scale), 16px from `lg`, under 18 / 20px card
  titles. Links on their own line take their text's size (`ROW_LINK`, `CARD_LINK`); the pills are
  `EBadgeSize.LG`, the questions `EDisclosureSize.LG`.
- **What a value describes:** from `lg` text and callout beside the schematic, 3fr : 2fr, 3rem
  apart, the schematic centred both ways with its caption under it at its width; below `lg`
  stacked, the schematic centred.
- **Figures** are the app's own charts on a fixture (`figures.constant.ts`), drawn with
  `isStatic` and an `overlay`; annotated months are picked from the data by their condition
  (`infoFigure.util`), never typed in. They mount at once; while the chart module loads (and on
  the server) their skeleton holds their exact size: the charts' own frames, legends and stats
  bar around a `ChartSkeleton` (`FigureFrames`, the parts without chart code). Annotation
  numbers: a 20px disc in the primary colour, white digits from 14px (`ANNOTATION_STYLE`,
  `INFO_FIGURE_CLASSES.MARKER`); brackets and leaders thin in the secondary text colour.

## PageLayout

[`PageLayout`](../src/components/page/PageLayout.tsx) draws, in order:

1. **Header** ([`PageHeader`](../src/components/PageHeader/PageHeader.tsx)): title and description.
2. **Controls:** searches, mini maps, the filter bar, Compare Periods' periods, drawing tools.
   With two places (Compare Cities) the mini map's header picks the one drawn larger: a compact
   `SegmentedControl`, each option the place's marker (`OptionMarker`) and its name, cut to fit.
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
