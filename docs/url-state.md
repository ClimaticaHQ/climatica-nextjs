# URL state

The URL is the single source of truth for everything a page shows: filters (dataset,
period, variables, resolution, months, Compare Periods' periods and years) and page view
state (city, chart mode, layout, shading, expanded panel, the side-by-side pair, the
overlay's shown years, the heat-map selection). Components read it; only a few hooks write
it. A shared link therefore opens exactly what was on screen.

## Who writes the URL

Router calls happen only in these hooks:

| Hook                                                                     | Owns                                                                                                                                                      | Writes                                                                                                                                                              |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`useFilterNavigation`](../src/hooks/filters/useFilterNavigation.ts)     | filter params                                                                                                                                             | `applyFilters(next, mode)`: replace for quick changes, push for an Apply ([`FILTER_NAVIGATION_MODES`](../src/constants/filters.constant.ts)). Page params are kept. |
| [`useUrlStateSync`](../src/hooks/ui/useUrlStateSync.ts)                  | a page's own params, described by its URL schema (e.g. [`COMPARE_PERIODS_URL_SCHEMA`](../src/app/compare-periods/_components/ComparePeriods.constant.ts)) | Replaces the URL when page state drifts from it; `pushUrlState` for explicit actions. Filter params are carried along untouched.                                    |
| [`useChartModeUrl`](../src/hooks/url/useChartModeUrl.ts)                 | `chart`                                                                                                                                                   | Replace, keeping every other param.                                                                                                                                 |
| [`useNavbarNavigation`](../src/hooks/url/useNavbarNavigation.ts)         | navbar and logo links                                                                                                                                     | Push to another page (see the last-page-params cache below).                                                                                                        |
| [`useCanonicalFilterUrl`](../src/hooks/filters/useCanonicalFilterUrl.ts) | canonical filter params                                                                                                                                   | Replaces once when the URL isn't canonical (see below).                                                                                                             |
| [`useLocaleNavigation`](../src/hooks/url/useLocaleNavigation.ts)         | the locale prefix                                                                                                                                         | Push to the same page and params under the new locale (the language switcher).                                                                                      |

Reading is simpler: [`useFilters`](../src/hooks/filters/useFilters.ts) parses the filters
from `useSearchParams`, and each page's schema parses its own params.

## How a page keeps its state in the URL

[`useUrlStateSync`](../src/hooks/ui/useUrlStateSync.ts) compares the page params in the URL
with the ones its state would write ([`decideUrlSyncAction`](../src/utils/urlParams.util.ts)):

- **external** — the URL changed to something this hook didn't write (load, Back/Forward,
  an edited address): the page restores its state from it (`onRestore`).
- **stateChange** — the state changed: the URL is replaced with the new params.
- **ownWrite** — the URL just caught up with the hook's own write: nothing to do.

Nothing is read or written before the first client render, when the persisted cities are
loaded. Then every field the URL carries wins, and the rest keep their persisted value or
default.

Writes are scheduled and re-checked when they run
([`canWriteUrlState`](../src/utils/urlStateGuard.util.ts)). A write is dropped if the page
is no longer the current route, if a link navigation is on its way elsewhere, or if the URL
changed since it was scheduled. Otherwise a late `replace` on the page being left would
cancel the navigation. [`NavigationIntentTracker`](../src/components/NavigationIntentTracker/NavigationIntentTracker.tsx)
records a link click's target in [`navigationIntentStore`](../src/stores/navigationIntentStore.ts)
before the router acts, and clears it when the route changes.

## Canonical filter params

[`getCanonicalFilterUrlParams`](../src/utils/filtersUrl.util.ts) turns any URL into its
canonical form: defaults are left out, invalid values are dropped, legacy params are
rewritten, values the dataset doesn't use (a climate period with Weather) are removed, and
the filters are normalized ([`normalizeFilters`](../src/utils/filters.util.ts)).
`useCanonicalFilterUrl` replaces the URL with that form once. The canonical form is a fixed
point, so this never loops.

Each filter's URL encoding is its codec in [`filterCodecs.util.ts`](../src/utils/filterCodecs.util.ts):
`parse` returns `null` for an absent or invalid value, `encode` writes it. Page params use
`TUrlField`s ([`urlFields.util.ts`](../src/utils/urlFields.util.ts)) that leave defaults out
of the URL.

## Legacy params

Old links keep working. These are read but never written:

| Old              | Now                                                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `year1`, `year2` | `periods` (Compare Periods' weather years) — `legacyParams` in [`FILTERS_CONFIG`](../src/constants/filters.constant.ts) |
| `wlLayout`       | `layout`                                                                                                                |
| `wlYears`        | `pair`                                                                                                                  |
| `chart=wl`       | Walter-Lieth (the default, written as no `chart` param)                                                                 |

The names are in [`SIDEBAR_PARAMS`](../src/constants/sidebar.constant.ts). Filters older
versions kept in localStorage are removed on load
([`useLegacyFilterStorageCleanup`](../src/hooks/filters/useLegacyFilterStorageCleanup.ts)).

## The last-page-params cache

Navbar links bring back each page's own params, for example Compare Periods' five years
and its layout, after a trip to another page.

- **Store:** [`lastPageParamsStore`](../src/stores/lastPageParamsStore.ts), persisted under
  `climatica:lastPageParams`. It's a cache, never a source of truth.
- **Single writer:** [`useLastPageParamsSync`](../src/hooks/url/useLastPageParamsSync.ts)
  records a page's own params whenever its URL changes. That means its URL state minus the
  city (the persisted city stores and the sync-city setting own that) plus its page-placed
  filters. See [`extractPageParams`](../src/utils/pageParams.util.ts).
- **Single reader:** [`useNavbarNavigation`](../src/hooks/url/useNavbarNavigation.ts), at
  click time. The rendered `href` carries only the shared filters, so the server and client
  render the same link and a new tab opens a plain, shareable URL. A plain click builds the
  full target with [`buildNavbarHref`](../src/utils/pageParams.util.ts): the remembered
  params plus the current shared filters (which win), re-validated through the page's own
  URL fields ([`REMEMBERED_PAGE_PARAMS`](../src/constants/pageParams.constant.ts)).
- Pages never read the store. A URL opened directly or from a shared link shows exactly
  what it says.

## UrlSync

App-wide URL upkeep runs once, in [`useFilterUrlSync`](../src/hooks/filters/useFilterUrlSync.ts):
canonical filter params, the last-page-params writer and the legacy storage cleanup. It
reads `useSearchParams`, so it needs a component inside a Suspense boundary, and
`AppLayout` sits above them all. [`UrlSync`](../src/layouts/UrlSync.tsx) is that host: it
only calls the hook and renders nothing, inside its own `Suspense` in
[`AppLayout`](../src/layouts/AppLayout.tsx).

## Why sheets close before navigating

A bottom sheet adds a same-URL history entry while it's open, so the system Back button
closes the sheet instead of leaving the page
([`useSheetHistory`](../src/hooks/ui/useSheetHistory.ts)).

Next's `router.replace` and `router.push` rewrite `history.state`. A router call while a
sheet is open would drop the sheet entry's marker, leaving a history entry that can't be
popped any more: a Back press that does nothing. So every write from the filters sheet goes
through [`useFiltersSheet`](../src/hooks/filters/useFiltersSheet.ts): `await closeSheet()`
first (the entry is popped and the popstate has arrived), then the router call.

## Flows

### Page load from a shared link

1. **Locale.** next-intl's middleware ([`src/proxy.ts`](../src/proxy.ts)) resolves the
   locale from the path (no prefix means English).
2. **Server render.** [`[locale]/layout.tsx`](../src/app/[locale]/layout.tsx) sets up the
   locale's messages, the providers and [`AppLayout`](../src/layouts/AppLayout.tsx). The
   route's `page.tsx` builds the metadata from the search params (`createLocaleMetadata` +
   `resolve…Meta` in [`metadata.util.ts`](../src/utils/metadata.util.ts)) and renders the
   page container inside `Suspense`.
3. **Reading the URL.** Client components render on the server too:
   - `useFilters` → `parseFilters(searchParams)` gives the filters. Absent or invalid
     values become defaults, and the result is normalized.
   - Data hooks don't fetch on the server (no prefetching), so the page renders its
     loading state.
4. **Hydration and canonical replace.** On the client, `UrlSync` → `useFilterUrlSync` runs:
   - `useCanonicalFilterUrl` checks `getCanonicalFilterUrlParams`. If the link had a
     default written out, an invalid or legacy value, it replaces the URL once (guarded by
     `canWriteUrlState`).
   - `useLastPageParamsSync` records the page's params.
5. **Page state restore.** After the first client render (`useIsClient`), the container's
   `useUrlStateSync` sees page params it didn't write ("external") and calls `onRestore`
   with `parseUrlState(schema, searchParams)`. The link's city, layout, chart mode and so
   on become the page state. Fields the link lacks keep their persisted value (the city)
   or default. If that state writes params the link lacked (e.g. the persisted city), the
   next pass is a "stateChange" and `replaceUrlParams` adds them.
6. **Data requests.** The data hooks run their queries with keys built from the city and
   the filters, through `apiClient` to `/api/worldclim/…` (see [Data](#data) below).

### A filter change on desktop (sidebar)

1. **Edit.** A section calls `onChange(key, value)` → `useFiltersDraft().setFilter`, which
   normalizes the draft (`normalizeFilters`). The URL doesn't change yet.
2. **Apply.** Either way, `FiltersSidebar`'s `commit` → `filtersDraft.submit()` (returns
   `null` while the typed year is invalid) → `useFilterNavigation().applyFilters(next, mode)`:
   - Auto-apply on (default): `useAutoApply` waits until the serialized draft has been
     unchanged for 200 ms, then commits as `QUICK`.
   - The Apply button commits as `APPLY`.
3. **URL.** `applyFilters` → `serializeFilters(next, searchParams)`: canonical filter
   params, page params kept. Then `replaceUrlParams` (`QUICK`) or `pushUrlParams` (`APPLY`),
   per `FILTER_NAVIGATION_MODES`, with `scroll: false`.
4. **Read back.** `useSearchParams` changes → `useFilters` re-parses. The draft follows the
   applied filters, so it isn't dirty any more. `useCanonicalFilterUrl` finds the URL
   already canonical, and `useUrlStateSync` finds the page params unchanged: neither
   writes.
5. **Data.** Hooks whose query key changed fetch, keeping the previous data on screen
   (`keepPreviousData`) while the progress bar shows. Changes outside the keys (variables,
   months, the climate period) are applied to the data already loaded.

### A filter change on mobile (filter bar and sheet)

1. **Chip.** A tap calls `useFiltersSheet().openFilter(key)` (a value chip), `openAll()`
   (the "Filters" chip) or `openUnavailableInfo()` (a chip disabled by Walter-Lieth).
2. **Sheet entry.** The sheet opens; `useSheetHistory` pushes a same-URL history entry with
   a marker, so system Back closes the sheet. `FiltersSheet` resets its draft
   (`discard()`).
3. **Edit.**
   - In one filter's sheet, a single-choice filter (dataset, period, resolution) applies on
     pick, unless it would exceed the heat map's cell limit. Other filters edit the draft
     until Apply.
   - In the all-filters sheet, everything edits the draft, and Reset goes back to the
     defaults.
4. **Apply.** `onApply(next, mode)` → `useFiltersSheet().applyAndClose(next, mode)`:
   - `await closeSheet()` goes `history.back()` off the sheet entry and resolves on the
     popstate, once the sheet has closed.
   - Then `applyFilters(next, mode)`: `QUICK` (replace) from one filter's sheet, `APPLY`
     (push) from the all-filters sheet.
5. **Read back and data:** as on desktop, steps 4–5. Closing without Apply (Back, the
   backdrop, a swipe, Escape) drops the draft.

### Back / Forward after an Apply

1. An Apply pushed a new entry. Back pops it: the router renders the previous entry's URL.
2. `useFilters` re-parses the previous filters, and the sidebar's draft follows them.
3. `useUrlStateSync` restores page state only if the page params differ ("external");
   after a filter-only Apply they don't.
4. Any URL write scheduled just before the popstate is dropped by `canWriteUrlState`,
   because the URL changed since it was scheduled.
5. The previous query keys are still in TanStack Query's cache, so the page shows their
   data at once, with no request (see [Data](#data)). Forward works the same way.

If a sheet is open, Back first closes the sheet (its own history entry), and only the next
Back leaves the current filters.

### Navbar navigation with the last-page-params cache

1. **Render.** Each navbar link's `href` is the route plus the current shared filters
   (`getHref` → `pickSharedFilterParams`). It's the same on the server and the client, and
   it's what a middle-click or "open in new tab" opens.
2. **Intent.** On click, `NavigationIntentTracker` (capture phase) records the target in
   `navigationIntentStore`, so late writes on the page being left are dropped.
3. **Target.** `useNavbarNavigation().navigate` (a plain left click only) prevents the
   default and reads the target's entry in `lastPageParamsStore`. `buildNavbarHref` merges:
   - the remembered page params, re-read through the page's URL fields;
   - the remembered page-placed filters (Compare Periods' periods and years);
   - the current shared filters, which win.
     `parseFilters` and `serializeFilters` then validate them together, so years remembered
     under Weather are dropped if the current dataset is Climate.
4. **Navigate.** `router.push(target)`. The new page then follows the page-load flow from
   step 4 (client-side, no server HTML).
5. **Record.** The route change clears the intent, and `useLastPageParamsSync` records the
   new page's params.

## Data

Data hooks ([`src/hooks/data/`](../src/hooks/data)) take the city from the page and the
filters from `useFilters()`, and build TanStack Query keys from what decides the request:

| Hook                                                                                                                 | Query key                                                                          |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [`useGetClimateData`](../src/hooks/data/useGetClimateData.ts)                                                        | `["climate", lat, lng, gridSize, "climate" or weatherYear]`                        |
| [`useGetCompareData`](../src/hooks/data/useGetCompareData.ts)                                                        | `["compare", latA, lngA, latB, lngB, gridSize, "climate" or weatherYear]`          |
| [`useGetComparePeriods`](../src/hooks/data/useGetComparePeriods.ts)                                                  | `["compare-periods", lat, lng, gridSize, "climate" or [yearA, yearB]]`             |
| [`useGetMultiPeriodData`](../src/hooks/data/useGetMultiPeriodData.ts)                                                | one query per year: `["compare-period", lat, lng, gridSize, year]`                 |
| [`useGetHeatmapData`](../src/hooks/data/useGetHeatmapData.ts)                                                        | `["heatmap", north, south, west, east, gridSize, variable, climatePeriod or year]` |
| [`useGetHeatmapPolygonData`](../src/hooks/data/useGetHeatmapPolygonData.ts)                                          | `["heatmap-polygon", wkt, gridSize, variable, climatePeriod or year]`              |
| [`useGetRegionalProfile`](../src/hooks/data/useGetRegionalProfile.ts)                                                | `["regional-profile", bbox…, wkt, gridSize, climatePeriod or year]`                |
| [`useGetAltitude`](../src/hooks/data/useGetAltitude.ts), [`useGetCellBounds`](../src/hooks/data/useGetCellBounds.ts) | `["altitude" / "cellBounds", lat, lng, gridSize]`                                  |

- **Why a change refetches:** a filter that's part of a key (location, resolution,
  dataset, weather year, the heat map's variable and period) gives a new key, so TanStack
  Query runs the request. `keepPreviousData` keeps the old data on screen meanwhile.
- **Why some changes don't:**
  - Climate normals for a point come in one request for every period, so the climate
    period is applied to the loaded data (`filterPointBindingsByPeriod`).
  - Point requests always ask for the same variables (`WEATHER_VARIABLES`), so variables
    and months only change what's drawn.
- **Why Back is served from the cache:** WorldClim values never change, so the data hooks
  use `staleTime: Infinity`: a cached key is never refetched. An unused key stays in the
  cache for TanStack Query v4's default 5 minutes. Back or Forward within that time
  re-renders from the cache with no request; after it, the request runs again. The server
  adds its own Redis cache for WorldClim resource lookups (see [backend.md](backend.md)).

## Parameter reference

Filter params are written by `useFilterNavigation` and kept canonical by
`useCanonicalFilterUrl`. Page params are written by each page's `useUrlStateSync` (and
`chart` also by `useChartModeUrl`). A param at its default is left out of the URL.

| Param                                            | Owner                   | Pages                                            | Default                                          | Allowed values                                                                                                                                   | Legacy            |
| ------------------------------------------------ | ----------------------- | ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| `dataset`                                        | filters                 | all                                              | `climate`                                        | `climate`, `weather`                                                                                                                             |                   |
| `period`                                         | filters                 | City Climate, Compare Cities, Heat map (Climate) | `c1970-2000`                                     | `c1951-1980`, `c1961-1990`, `c1970-2000`, `c1981-2010`, `c1991-2020`                                                                             |                   |
| `year`                                           | filters                 | City Climate, Compare Cities, Heat map (Weather) | `2024`                                           | 1951–2024                                                                                                                                        |                   |
| `var`                                            | filters                 | all                                              | `tmax,tmin,prec`                                 | comma list of `tmax`, `tmin`, `prec`, `srad`, `wind`, `vapr`. `srad`, `wind` and `vapr` only with Climate 1970–2000; Weather has the first three |                   |
| `grid`                                           | filters                 | all                                              | `2.5m`                                           | `10m`, `5m`, `2.5m`, `30s` (`30s` only with Climate 1970–2000)                                                                                   |                   |
| `months`                                         | filters                 | all (disabled on the heat map)                   | `all`                                            | `all` or a comma list of 1–12                                                                                                                    |                   |
| `period1`, `period2`                             | filters                 | Compare Periods (Climate)                        | `c1970-2000`, `c1991-2020`                       | climate periods; never equal                                                                                                                     |                   |
| `periods`                                        | filters                 | Compare Periods (Weather)                        | `2021,1967`                                      | 2–5 years, 1951–2024                                                                                                                             | `year1` + `year2` |
| `city`, `lat`, `lng`                             | page                    | City Climate, Compare Periods                    | the persisted city (first visit: Madrid)         | name; coordinates with 4 decimals                                                                                                                |                   |
| `cityA`, `latA`, `lngA`, `cityB`, `latB`, `lngB` | page                    | Compare Cities                                   | the persisted cities (first visit: Madrid, Rome) | as above                                                                                                                                         |                   |
| `chart`                                          | page, `useChartModeUrl` | City Climate, Compare Cities, Compare Periods    | Walter-Lieth (absent)                            | `standard`                                                                                                                                       | `chart=wl`        |
| `layout`                                         | page                    | Compare Cities, Compare Periods                  | `split` (absent)                                 | `overlay`                                                                                                                                        | `wlLayout`        |
| `wlShading`                                      | page                    | Compare Cities, Compare Periods                  | `a`                                              | `b`, `none`                                                                                                                                      |                   |
| `expanded`                                       | page                    | Compare Cities, Compare Periods                  | both panels (absent)                             | `a`, `b`                                                                                                                                         |                   |
| `pair`                                           | page                    | Compare Periods (Weather, side by side)          | the first two years                              | two different compared years, `y1,y2`                                                                                                            | `wlYears`         |
| `shownYears`                                     | page                    | Compare Periods (Weather, overlay)               | Walter-Lieth: the pair; standard: every year     | compared years, comma list                                                                                                                       |                   |
| `north`, `south`, `west`, `east`                 | page                    | Heat map                                         | no selection                                     | a drawn box                                                                                                                                      |                   |
| `polygon`                                        | page                    | Heat map                                         | no selection                                     | a drawn polygon (WKT)                                                                                                                            |                   |

The locale isn't a param: it's the path prefix (`/es/…`), changed by `useLocaleNavigation`.

## Push or replace

| Action                                                                  | Hook → call                                        | History | Back afterwards                                  |
| ----------------------------------------------------------------------- | -------------------------------------------------- | ------- | ------------------------------------------------ |
| Sidebar Apply button                                                    | `useFilterNavigation` → `pushUrlParams`            | push    | the filters before the Apply                     |
| Sidebar auto-apply                                                      | `useFilterNavigation` → `replaceUrlParams`         | replace | skips the change: the entry before the last push |
| Sheet with every filter: Apply                                          | `useFiltersSheet` → `applyFilters(…, APPLY)`       | push    | the filters before the Apply                     |
| One filter's sheet: pick or Apply                                       | `useFiltersSheet` → `applyFilters(…, QUICK)`       | replace | skips the change                                 |
| Compare Periods' selectors on the page (below lg)                       | `useFilterNavigation` (`QUICK`)                    | replace | skips the change                                 |
| Canonicalising a URL                                                    | `useCanonicalFilterUrl`                            | replace | — (the non-canonical address is gone)            |
| Picking a city (search, "use my location", a map click on City Climate) | `useUrlStateSync().pushUrlState`                   | push    | the previous city                                |
| The city name resolved after a map click                                | `useUrlStateSync` (state change)                   | replace | the city before the click                        |
| Drawing or clearing a heat-map selection                                | `pushUrlState`                                     | push    | the previous selection                           |
| Layout, shading, expanded panel, the pair, shown years                  | `useUrlStateSync` (state change)                   | replace | skips the change                                 |
| Chart type (header switch, "Switch to standard chart")                  | `useChartModeUrl` → `replaceUrlParams`             | replace | skips the change                                 |
| Navbar or logo link                                                     | `useNavbarNavigation` → `router.push`              | push    | the previous page as it was                      |
| Language switch                                                         | `useLocaleNavigation` → `navigateWithIntent`       | push    | the same page in the previous language           |
| Opening a filters sheet                                                 | `useSheetHistory` → `history.pushState` (same URL) | push    | closes the sheet                                 |

"Skips the change" means Back goes to the entry before the last push. A replaced change
disappears together with everything else since that push.
