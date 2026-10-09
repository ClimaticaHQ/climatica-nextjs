# Testing

Two suites: Vitest for units (pure functions, hooks, components, route handlers) and
Playwright for end-to-end behaviour in a real browser. A Python suite covers the Solr data
script. Before a task is done, `npm run check`, `npm run test`, `npm run build` and
`npm run test:e2e` all pass (see [AGENTS.md](../AGENTS.md)).

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

Layout of [`tests/unit/`](../tests/unit): `app/` (page URL state), `components/`, `hooks/`,
`redis/`, `routes/`, `services/`, `stores/`, `utils/`.

### Conventions for component and hook tests

- **Render inside `NextIntlClientProvider`** with the real messages
  (`import messages from "@/i18n/locales/en.json"`), and assert on the user-visible text.
- **Import components by their file path,** not through `@/components` or `@/hooks`. The
  barrels pull in next-intl's navigation, which can't resolve `next/navigation` under
  Vitest.
- **Mock the URL hooks** a component reaches (`vi.mock("@/hooks/filters/useFilterNavigation", …)`,
  `useFilters`, `useChartModeUrl`), with a hoisted object recording the calls. See
  [`periodSelectors.test.tsx`](../tests/unit/components/periodSelectors.test.tsx).
- **Stub missing browser APIs** in `beforeAll`: jsdom has no `matchMedia` or
  `ResizeObserver` (see [`yearChips.test.tsx`](../tests/unit/components/yearChips.test.tsx)).
- **Use plain DOM assertions** (`getAttribute`, `hasAttribute`, `textContent`); jest-dom
  matchers aren't installed.
- **Hooks:** `renderHook` and `act` from `@testing-library/react`, as in
  [`useFiltersSheet.test.ts`](../tests/unit/hooks/useFiltersSheet.test.ts).

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
