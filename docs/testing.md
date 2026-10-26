# Testing

Vitest for units (pure functions, hooks, components, route handlers), Playwright for end-to-end
behaviour in a real browser, pytest for the Solr data script.

## Vitest

Config: [`vitest.config.mjs`](../vitest.config.mjs); `tests/unit/**/*.test.{ts,tsx}`.

- **Node by default;** a file that renders opts into jsdom with `// @vitest-environment jsdom` on
  its first line.
- **Setup:** [`tests/setup.ts`](../tests/setup.ts) gives `WORLDCLIM_API_KEY` a test value so
  `Env.ts` validates.
- `npm run test:coverage` (v8) over `src/`, without types, enums and `src/app/`.

### Components and hooks

- Render inside `NextIntlClientProvider` with the real English messages; assert on visible text.
- Import components by file path, not through the `@/components` or `@/hooks` barrels — they pull
  in the URL hooks, which need the router.
- Mock the URL hooks a component reaches (`useFilterNavigation`, `useFilters`, `useChartModeUrl`)
  with a hoisted object recording calls ([`periodSelectors.test.tsx`](../tests/unit/components/periodSelectors.test.tsx)).
- jsdom lacks `matchMedia` and `ResizeObserver`: stub them
  ([`stubChartEnvironment`](../tests/unit/charts/chartTestEnv.ts), which also selects reduced motion
  and quiets Recharts' size warnings). For touch, stub `TOUCH_MEDIA_QUERY` to match.
- Plain DOM assertions; jest-dom isn't installed. No `as` casts in tests either.
- Data hooks against an API error: `axiosInstance.defaults.adapter = "fetch"` and a stubbed
  `fetch` returning the route's error status, in a `QueryClientProvider` with `retry: false`
  ([`upstreamErrors.test.tsx`](../tests/unit/hooks/upstreamErrors.test.tsx)).

### Charts and pages

- **Fixtures:** [`chartFixtures.ts`](../tests/unit/charts/chartFixtures.ts) builds every page's
  series (city, pair, periods, weather years) with their markers.
- **Blocks:** [`chartBlocks.test.tsx`](../tests/unit/charts/chartBlocks.test.tsx) renders the card for
  every series kind, chart type and layout and counts blocks, so a new block is covered.
- **A page through its hook:** render the container with its data hooks mocked by module path and
  the URL given through a mocked `next/navigation` `useSearchParams`; the real URL and filter hooks
  read it ([`comparePeriodsPage.test.tsx`](../tests/unit/app/comparePeriodsPage.test.tsx)).
- jsdom gives charts no size, so Recharts draws nothing; test chart logic through its props (call
  the component as a function and read the element's props) or its pure utils.

### Route handlers

Mock `server-only`, `@/libs/Logger`, `@/libs/redis/client`, `@/libs/Env` (and `@/libs/services`
for `/api/cities`). Stub `fetch` with `ok` and `status`, and cover non-2xx, a rejected `fetch` and
a non-JSON body: each must give the error status and no Redis write
([`worldclimQueryRoute.test.ts`](../tests/unit/routes/worldclimQueryRoute.test.ts)).

## Playwright

Config: [`playwright.config.ts`](../playwright.config.ts); `tests/e2e/*.e2e.ts`.

- One Chromium project ("Desktop Chrome", from lg up), one worker, serial.
- Reuses a dev server on `PORT` or starts one. The Docker services and a real
  `WORLDCLIM_API_KEY` are needed: tests load real data through the proxy.
- Screenshot and trace on failure; 1 retry on CI. Files testing races (navigation, URL state) set
  `retries: 0`, so a flaky pass can't hide a bug.

### Breakpoints and touch

- A whole file on a phone: `test.use({ ...devices["Pixel 7"] })`
  ([`mobileFilters.e2e.ts`](../tests/e2e/mobileFilters.e2e.ts)); with touch, add
  `hasTouch: true, isMobile: true` and tap ([`mobileChart.e2e.ts`](../tests/e2e/mobileChart.e2e.ts)).
- One test at another width: `page.setViewportSize` before `goto`.
- Below lg the sidebar is hidden, from lg the filter bar; Compare Periods' selectors exist once per
  breakpoint. Scope locators to the container you mean.

### Conventions

- Find elements by role and accessible name; test ids only for controls without one.
- Assert on the URL for state changes — it's the source of truth.
- Wait for state, not time: `toBeVisible({ timeout: 30_000 })` for the first load, `expect.poll`
  for values read from the page.
- To control timing, hold a request with `page.route` and release it from the test.

## Python

`npm run test:python` runs pytest on [`docker/solr/scripts/`](../docker/solr/scripts) from `.venv`,
with small fixtures (no GeoNames download). First run:

```bash
python3 -m venv .venv
.venv/bin/pip install -r docker/solr/scripts/requirements-dev.txt
```
