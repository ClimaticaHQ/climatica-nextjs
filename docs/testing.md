# Testing

Two suites: Vitest for units (pure functions, hooks, components, route handlers) and
Playwright for end-to-end behaviour in a real browser. A Python suite covers the Solr data
script.

## Vitest

Config: [`vitest.config.mjs`](../vitest.config.mjs). One project, `unit`, runs
`tests/unit/**/*.test.{ts,tsx}`.

- **Node by default.** Pure functions, stores, route handlers and services run without a
  DOM. A file that renders components or hooks opts into jsdom on its first line:
  ```ts
  // @vitest-environment jsdom
  ```
- **Setup:** [`tests/setup.ts`](../tests/setup.ts) gives `WORLDCLIM_API_KEY` a test value,
  so `src/libs/Env.ts` validates. The config also loads `.env` into the test environment.
- **Path aliases** (`@/…`) resolve from `tsconfig.json`.
- **Coverage:** `npm run test:coverage` (v8) over `src/`, excluding types, enums and
  `src/app/`.
- `npm run test:watch` re-runs on change.

Layout of [`tests/unit/`](../tests/unit): `app/` (pages and their URL state), `charts/` (chart model and card), `components/`, `hooks/`,
`redis/`, `routes/`, `services/`, `stores/`, `styles/` (colour tokens and contrast), `utils/`.

### Conventions for component and hook tests

- **Render inside `NextIntlClientProvider`** with the real messages
  (`import messages from "@/i18n/locales/en.json"`), and assert on the user-visible text.
- **Import components by their file path,** not through `@/components` or `@/hooks`. The
  barrels pull in the URL hooks, which use the Next.js router.
- **Mock the URL hooks** a component reaches (`vi.mock("@/hooks/filters/useFilterNavigation", …)`,
  `useFilters`, `useChartModeUrl`), with a hoisted object recording the calls. See
  [`periodSelectors.test.tsx`](../tests/unit/components/periodSelectors.test.tsx).
- **Stub missing browser APIs** in `beforeAll`: jsdom has no `matchMedia` or
  `ResizeObserver` (see [`chartTestEnv.ts`](../tests/unit/charts/chartTestEnv.ts)'s
  `stubChartEnvironment`).
- **Use plain DOM assertions** (`getAttribute`, `hasAttribute`, `textContent`); jest-dom
  matchers aren't installed.
- **Hooks:** `renderHook` and `act` from `@testing-library/react`, as in
  [`useFiltersSheet.test.ts`](../tests/unit/hooks/useFiltersSheet.test.ts).
- **Data hooks against an API error:** set `axiosInstance.defaults.adapter = "fetch"` and
  stub `fetch` with a `Response` carrying the route's error status, so the real
  `apiClient` decides what counts as an error. Wrap in a `QueryClientProvider` with
  `retry: false`. See [`upstreamErrors.test.tsx`](../tests/unit/hooks/upstreamErrors.test.tsx).

### Conventions for chart tests

- **Fixtures:** [`chartFixtures.ts`](../tests/unit/charts/chartFixtures.ts) builds the series
  every chart page draws (a city, a city pair, a period pair, weather years).
- **Chart blocks:** [`chartBlocks.test.tsx`](../tests/unit/charts/chartBlocks.test.tsx)
  renders the chart card for every page's series, in both chart types and every layout, and
  counts the blocks by `data-chart-block`. A block added to the registry is checked there
  without changes.
- **Rendering charts in jsdom:** `stubChartEnvironment()`
  ([`chartTestEnv.ts`](../tests/unit/charts/chartTestEnv.ts)) stubs `matchMedia` (with reduced
  motion) and `ResizeObserver` and quiets Recharts' size warnings; mock `next/navigation` —
  the charts reach the hooks barrel, whose URL hooks use the router.

### Conventions for page tests

- **A page through its page hook:** render the page's container with its data hooks mocked
  by module path (`@/hooks/data/useGetClimateData`, …) and the URL given through a mocked
  `next/navigation`'s `useSearchParams`; the real URL and filter hooks read it. See
  [`cityClimatePage.test.tsx`](../tests/unit/app/cityClimatePage.test.tsx).
- **Region Heatmap:** [`heatMapPage.test.tsx`](../tests/unit/app/heatMapPage.test.tsx) renders
  the page with its cell hooks mocked: no region, a box from the URL, loading, no data, a
  failed request (translated). [`heatMap.e2e.ts`](../tests/e2e/heatMap.e2e.ts) opens box URLs
  against real data and checks the stats bar: the Climate box guards the query row limit, a
  1,080-cell box the strips, and a box over the cell cap the resolution it suggests.
  [`regionQuery.test.ts`](../tests/unit/utils/regionQuery.test.ts) covers the strips (every
  cell once, each within the row cap, at most 4 within the cell cap) and their merging.
- **Weather years:** [`comparePeriodsPage.test.tsx`](../tests/unit/app/comparePeriodsPage.test.tsx)
  renders both datasets through the page hook (a year still loading, side pickers, the empty
  state); [`seriesChips.test.tsx`](../tests/unit/charts/seriesChips.test.tsx) covers the
  overlay's chips.
- **Reduced motion** (`stubChartEnvironment`): a chart type switch from the URL, after the first
  render, replaces the body at once instead of crossfading. See also
  [`compareCitiesPage.test.tsx`](../tests/unit/app/compareCitiesPage.test.tsx).
- **Settings and language:** [`settingsStore.test.ts`](../tests/unit/stores/settingsStore.test.ts)
  covers the store's defaults, invalid values and the migration from every old key;
  [`theme.test.ts`](../tests/unit/utils/theme.test.ts) the system theme and the inline head
  script; [`locale.test.ts`](../tests/unit/utils/locale.test.ts) the locale order (cookie,
  `Accept-Language`, English) and the prefix stripping;
  [`settingsPage.test.tsx`](../tests/unit/app/settingsPage.test.tsx) the dependent Update
  highlight (disabled, not hidden) and reduced motion, with a `matchMedia` stub the test can
  change while the page is open.
  [`settings.e2e.ts`](../tests/e2e/settings.e2e.ts) opens settings from the gear and the phone
  menu, checks Back, the theme without a flash (the app's scripts blocked) and the settings
  taking effect on a chart page; [`i18n.e2e.ts`](../tests/e2e/i18n.e2e.ts) the language from the
  cookie and `Accept-Language`, switching on settings, and an old prefixed link.
- **Colours:** [`colorTokens.test.ts`](../tests/unit/styles/colorTokens.test.ts) scans `src/`
  for colour literals outside `tokens.css` and the allowlist, and checks the token layers
  ([colors.md](colors.md)).
- **Stale data after a pick:** [`citySync.e2e.ts`](../tests/e2e/citySync.e2e.ts) picks a city
  and checks every block, the title, the export's file name and the synced pages. The search
  only lists results for the text typed (it shows its loading state until then), so a test
  can pick the first result as soon as the list shows.

### Conventions for route handler tests

- Mock `server-only`, `@/libs/Logger`, `@/libs/redis/client`, `@/libs/Env` and, for
  `/api/cities`, `@/libs/services`. See
  [`citiesRoute.test.ts`](../tests/unit/routes/citiesRoute.test.ts).
- **Stub `fetch` with `ok` and `status`,** not only `json`, and cover the failures: a
  non-2xx status, a rejected `fetch` and a body that isn't JSON must each give the error
  status and no Redis write. See
  [`worldclimQueryRoute.test.ts`](../tests/unit/routes/worldclimQueryRoute.test.ts).

## Playwright

Config: [`playwright.config.ts`](../playwright.config.ts). Tests are `tests/e2e/*.e2e.ts`.

- **Browser:** one project, Chromium as "Desktop Chrome" (1280×720, from lg up, so the
  sidebar is shown). One worker, run serially.
- **Server:** reuses a dev server on `PORT` (3000) or starts `npm run dev`. The Docker
  services must be running, and a valid `WORLDCLIM_API_KEY` is needed: tests load real
  WorldClim data through the app's proxy.
- **On failure:** a screenshot; a trace too (always on CI, kept on failure locally).
  Retries: 1 on CI, none locally. Files that test races (navigation, URL state) set
  `retries: 0`, so a flaky pass can't hide a real bug.
- `npm run test:e2e:ui` and `test:e2e:debug` open the UI mode and the inspector.

### Mobile and breakpoint scenarios

- **A whole file on a phone:** `test.use({ ...devices["Pixel 7"] })` at the top, as in
  [`mobileFilters.e2e.ts`](../tests/e2e/mobileFilters.e2e.ts). It covers the filter bar,
  the sheets (including system Back closing a sheet), and the page-level period selectors.
- **One test at another width:** `await page.setViewportSize({ width: 1024, height: 800 })`
  before `goto`, as in [`periodSelectors.e2e.ts`](../tests/e2e/periodSelectors.e2e.ts).
- Below lg the sidebar is hidden, and from lg the filter bar is. Compare Periods' period
  selectors exist only once per breakpoint: on the page below lg, in the sidebar from lg.
  Scope locators to the container you mean (`page.locator("aside")`, `page.locator("main")`).

### Conventions for e2e tests

- **Find elements by role and accessible name** (`getByRole("button", { name: "Add period" })`).
  Use test ids only for controls without a stable name (e.g. `period-b-select`).
- **Assert on the URL** for state changes (`await expect(page).toHaveURL(/period2=…/)`),
  since the URL is the source of truth.
- **Wait for state, not time:** `expect(...).toBeVisible({ timeout: 30_000 })` for the
  first data load, and `expect.poll` for values read from the page.
- **To control timing, hold a request** with `page.route` and release it from the test, as
  in the "middle year loading last" test in [`chartMode.e2e.ts`](../tests/e2e/chartMode.e2e.ts).

## Python

`npm run test:python` runs pytest on [`docker/solr/scripts/`](../docker/solr/scripts) from
the project's `.venv`. It covers `prepare_data.py`'s label fallbacks, alternate-name
preference and locale loading, using small fixtures (no GeoNames download). First run:

```bash
python3 -m venv .venv
.venv/bin/pip install -r docker/solr/scripts/requirements-dev.txt
```
