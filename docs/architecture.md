# Architecture

How the app is put together: where code lives, how data reaches a component, and how pages
are split. Charts and the page structure get their own documents after the page-structure
refactor.

## Folder structure

| Path                                                       | What lives there                                                                                                                                            |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`src/app/[locale]/`](../src/app/[locale])                 | Next.js routes. Each `page.tsx` sets the request locale and renders its page container inside `Suspense`. `/` redirects to `/climate-statistics`.           |
| `src/app/<page>/_components/`                              | A page's container, view and their type / constant / util files (e.g. [`climate-statistics/_components`](../src/app/climate-statistics/_components)).       |
| [`src/app/api/`](../src/app/api)                           | Route handlers: `cities`, `worldclim/[queryId]`, `worldclim/resource`, `og`. See [backend.md](backend.md).                                                  |
| [`src/app/providers.tsx`](../src/app/providers.tsx)        | TanStack Query client and the theme bootstrap.                                                                                                              |
| [`src/layouts/`](../src/layouts)                           | The app shell: [`AppLayout`](../src/layouts/AppLayout.tsx) (topbar, sidebar, main) and [`UrlSync`](../src/layouts/UrlSync.tsx).                             |
| [`src/components/`](../src/components)                     | Components. Shared primitives in `UI/`, features in their own folder (e.g. `filters/`), shared non-UI components (Card, ChartLegend…) in their own folders. |
| [`src/hooks/`](../src/hooks)                               | `data/` (queries), `filters/`, `url/`, `ui/`, `persisted/`.                                                                                                 |
| [`src/libs/`](../src/libs)                                 | `api/` (axios `apiClient`), `services/` (WorldClim, Solr, Wikidata), `redis/` (client, strategies, rate limit), `Env.ts`, i18n setup.                       |
| [`src/stores/`](../src/stores)                             | Zustand stores and the persisted location stores.                                                                                                           |
| `src/constants/`, `src/enums/`, `src/types/`, `src/utils/` | Shared constants, enums, types and pure functions.                                                                                                          |
| [`src/i18n/locales/`](../src/i18n/locales)                 | Message files, one per locale. See [i18n.md](i18n.md).                                                                                                      |
| [`src/styles/`](../src/styles)                             | Global CSS, split by concern and imported by `global.css`.                                                                                                  |
| [`docker/`](../docker)                                     | Solr and Redis for local development. See [operations.md](operations.md).                                                                                   |
| [`tests/`](../tests)                                       | `unit/` (Vitest) and `e2e/` (Playwright). See [testing.md](testing.md).                                                                                     |

## Data flow

```
Component → hook (src/hooks/) → apiClient (src/libs/api/)
          [→ client service, e.g. WorldClimService]
          → /api route handler (src/app/api/)
          → Redis cache → Solr / WorldClim / Wikidata
```

- **Components never call the network.** They use hooks; queries live in
  [`src/hooks/data/`](../src/hooks/data) and use TanStack Query (WorldClim data with
  `staleTime: Infinity`, since a period's values never change).
- **Hooks reach external data only through `/api` routes**, with the shared axios instance
  [`apiClient`](../src/libs/api/apiClient.ts) (same-origin base URL, 50 s timeout). City
  lookups call `/api/cities` directly from the hook
  ([`useSearchCity`](../src/hooks/data/useSearchCity.ts)); WorldClim calls go through
  [`WorldClimService`](../src/libs/services/worldClimService.ts), which builds the query
  parameters and validates responses.
- **The server keeps the secrets and the cache.** Route handlers add the WorldClim API key,
  rate-limit per IP and cache in Redis; Solr and Wikidata are reached only from the server
  ([`solrService`](../src/libs/services/solrService.ts) and
  [`wikidataService`](../src/libs/services/wikidataService.ts) import `server-only`).

## Pages: container and view

Every page is split in two (see [`ClimateStatistics.tsx`](../src/app/climate-statistics/_components/ClimateStatistics.tsx)
and [`ClimateStatisticsView.tsx`](../src/app/climate-statistics/_components/ClimateStatisticsView.tsx)):

- **Container** — reads filters and page state from the URL, runs the data hooks, owns
  event handlers, and passes plain props down.
- **View** — renders only. It doesn't fetch or keep state beyond UI-only details.

Filters and page view state live in the URL, not in component state. See
[url-state.md](url-state.md).

## State

| Kind                                                          | Where                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server data                                                   | TanStack Query                                                                                                                                                                                                                                                  |
| Filters and page view state (chart mode, layout, years, city) | URL search params                                                                                                                                                                                                                                               |
| Client-only, not page state                                   | Zustand: [`settingsStore`](../src/stores/settingsStore.ts) (persisted preferences), [`lastPageParamsStore`](../src/stores/lastPageParamsStore.ts) (navbar cache), [`navigationIntentStore`](../src/stores/navigationIntentStore.ts) (in-flight link navigation) |
| Persisted city and heat-map box                               | [`persistedLocationStores`](../src/stores/persistedLocationStores.ts) (small `useSyncExternalStore` stores, not Zustand)                                                                                                                                        |
| UI-only (open, hover, drafts)                                 | `useState`                                                                                                                                                                                                                                                      |

## Where shared UI lives

- **Primitives** in [`src/components/UI/`](../src/components/UI): Button, Chip, Dropdown,
  BottomSheet, CollapsibleSection, SwapButton, skeletons and others.
- **Shared components outside UI** in their own folders: Card, ChartLegend, PageHeader,
  SegmentedControl, ScrollEdgeFades, SeriesMarker, Settings.
- The full list, with each component's purpose and key props, is the "Shared UI
  components" catalog in [AGENTS.md](../AGENTS.md). Search it before creating a component.
