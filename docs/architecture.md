# Architecture

How the app is put together: where code lives, how data reaches a component, and how pages
are split. How a page is built is in [pages.md](pages.md); how its chart is built, in
[charts.md](charts.md).

## Folder structure

| Path                                                       | What lives there                                                                                                                                                                                                      |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`src/app/`](../src/app)                                   | Next.js routes, without a locale prefix ([i18n.md](i18n.md)). Each `page.tsx` renders its page container inside `Suspense`. `/` redirects to `/climate-statistics`; `/settings` is the settings page.                 |
| `src/app/<page>/_components/`                              | A page's container, view and their type / constant / util files (e.g. [`climate-statistics/_components`](../src/app/climate-statistics/_components)).                                                                 |
| [`src/app/api/`](../src/app/api)                           | Route handlers: `cities`, `worldclim/[queryId]`, `worldclim/resource`, `og`. See [backend.md](backend.md).                                                                                                            |
| [`src/app/providers.tsx`](../src/app/providers.tsx)        | TanStack Query client.                                                                                                                                                                                                |
| [`src/layouts/`](../src/layouts)                           | The app shell: [`AppLayout`](../src/layouts/AppLayout.tsx) (topbar, the filters sidebar on filter pages, main, [`ThemeRoot`](../src/components/ThemeRoot/ThemeRoot.tsx)) and [`UrlSync`](../src/layouts/UrlSync.tsx). |
| [`src/components/`](../src/components)                     | Components. Shared primitives in `UI/`, features in their own folder (`filters/`, `charts/`, `page/`), shared non-UI components (Card, ChartLegend…) in their own folders.                                            |
| [`src/hooks/`](../src/hooks)                               | `data/` (queries), `filters/`, `url/`, `ui/`, `persisted/`, `charts/` (the chart model, its exports and chart hooks), `pages/` (each page's hook and the logic pages share).                                          |
| [`src/libs/`](../src/libs)                                 | `api/` (axios `apiClient`), `services/` (WorldClim, Solr, Wikidata), `redis/` (client, strategies, rate limit), `Env.ts`, i18n setup.                                                                                 |
| [`src/stores/`](../src/stores)                             | Zustand stores and the persisted location stores.                                                                                                                                                                     |
| `src/constants/`, `src/enums/`, `src/types/`, `src/utils/` | Shared constants, enums, types and pure functions.                                                                                                                                                                    |
| [`src/i18n/locales/`](../src/i18n/locales)                 | Message files, one per locale. See [i18n.md](i18n.md).                                                                                                                                                                |
| [`src/styles/`](../src/styles)                             | Global CSS, split by concern and imported by `global.css`.                                                                                                                                                            |
| [`docker/`](../docker)                                     | Solr and Redis for local development. See [operations.md](operations.md).                                                                                                                                             |
| [`tests/`](../tests)                                       | `unit/` (Vitest) and `e2e/` (Playwright). See [testing.md](testing.md).                                                                                                                                               |

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

## Pages

Every page is a one-line container and a short view: the container calls the page's hook in
[`src/hooks/pages/`](../src/hooks/pages) and passes the result to the view, which fills the
shared [`PageLayout`](../src/components/page/PageLayout.tsx) (header, controls, the results'
status, then summary, main content and details). Every difference between pages lives in the
hook; the chart pages' main content is the shared
[`ChartSection`](../src/components/charts/ChartSection.tsx), drawn from a list of series and
the model derived from them.

- [pages.md](pages.md): the three layers, the four pages, `PageLayout` and its spacing, data
  states and errors, the shared page hooks, and how to add a block on every page or a new
  chart page.
- [charts.md](charts.md): series and kind rules, the model, view state and features, the chart
  section, card and bodies, the chart block registry (and how to add a block under every
  chart), exports and data updates.

Filters and page view state live in the URL, not in component state. See
[url-state.md](url-state.md).

## State

| Kind                                                          | Where                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server data                                                   | TanStack Query                                                                                                                                                                                                                                                  |
| Filters and page view state (chart mode, layout, years, city) | URL search params                                                                                                                                                                                                                                               |
| Client-only, not page state                                   | Zustand: [`settingsStore`](../src/stores/settingsStore.ts) (persisted preferences), [`lastPageParamsStore`](../src/stores/lastPageParamsStore.ts) (navbar cache), [`navigationIntentStore`](../src/stores/navigationIntentStore.ts) (in-flight link navigation) |
| Persisted cities                                              | [`persistedLocationStores`](../src/stores/persistedLocationStores.ts) (small `useSyncExternalStore` stores, not Zustand)                                                                                                                                        |
| UI-only (open, hover, drafts)                                 | `useState`                                                                                                                                                                                                                                                      |

## Settings

The reader's preferences are one persisted Zustand store,
[`settingsStore`](../src/stores/settingsStore.ts), under the single localStorage key
`climatica:settings`: theme (light / dark / system, default system), animations, the update
highlight, auto-apply filters, sync city and auto-scroll. Defaults are `SETTINGS_DEFAULTS` in
[`settings.constant.ts`](../src/constants/settings.constant.ts). The language is not in it: it's
the `NEXT_LOCALE` cookie the server reads ([i18n.md](i18n.md)).

- **Version and migration.** The store is at version 1. Its `migrate`
  ([`migrateSettings`](../src/utils/settings.util.ts)) takes a version 0 `climatica:settings`
  and the theme from the old `climatica:theme` or `theme` key; a saved choice migrates as it is.
  Invalid or missing values fall back to the defaults (`mergePersistedSettings`). Once the store
  has hydrated, [`useLegacyStorageCleanup`](../src/hooks/persisted/useLegacyStorageCleanup.ts)
  removes the old keys (`LEGACY_STORAGE_KEYS`, including the dead `climatica:lang`).
- **Theme.** An inline script in the root layout's `<head>`
  ([`THEME_INIT_SCRIPT`](../src/constants/theme.constant.ts)) reads the saved theme (falling back
  to the old keys, then system) and sets the `dark` class before the first paint, so there's no
  flash. After that, [`ThemeRoot`](../src/components/ThemeRoot/ThemeRoot.tsx)
  ([`useThemeSync`](../src/hooks/ui/useThemeSync.ts)) keeps the class in step with the store,
  and with `prefers-color-scheme` while the theme is system.
- **Settings page.** `/settings` ([`useSettingsPage`](../src/hooks/pages/useSettingsPage.ts),
  [`src/app/settings/_components/`](../src/app/settings/_components)) writes the store directly,
  so a change applies at once. A setting that needs another one on is nested under it
  (`SettingsDependentRows`) and stays visible but disabled while that one is off, with a hint in
  place of its description (`SettingsRow`'s `isDisabled` and `disabledHint`). Update highlight
  depends on Animations, and both are disabled while the device asks for reduced motion
  (followed live). It has no filters: the sidebar and the mobile filter bar show
  only on filter pages. It's opened from the topbar's gear (desktop) and the menu's Settings
  item (mobile); the link carries the shared filters, and Back returns to the previous page's
  URL.

## Where shared UI lives

- **Primitives** in [`src/components/UI/`](../src/components/UI): Button, Chip, Dropdown,
  BottomSheet, StatusMessage, StatCell, PairLayout, ChipScroller, skeletons and others.
- **Shared components outside UI** in their own folders: Card, ChartLegend, PageHeader,
  SegmentedControl, ScrollEdgeFades, SeriesMarker, ThemeRoot.
- **Features** in one folder each, flat: `charts/` (the chart section, card, bodies, blocks),
  `page/` (`PageLayout`), `filters/`.
- The full list, with each component's purpose and key props, is the "Shared UI
  components" catalog in [AGENTS.md](../AGENTS.md). Search it before creating a component.
