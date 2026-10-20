# AGENTS.md

Rules for working in this repository. The explanations are in docs/ (start at docs/README.md).

## Principles

- Clarity and consistency over cleverness. Minimal changes. Match existing patterns.
- Reuse before creating: extend an existing component, hook or util before adding one.
- TypeScript everywhere; no `any` unless isolated and necessary.
- No unnecessary `try/catch`. No casting; use narrowing.
- Named exports only (default exports only for Next.js pages).
- Absolute imports via `@/` unless same directory.
- Follow the ESLint setup; don't reformat unrelated code.
- Let the compiler infer return types unless an annotation adds clarity.
- Options object for 3+ params, optional flags or ambiguous args. No inline object shapes in function signatures: name the type.
- No magic strings or numbers: name them as constants.
- Debug by hypothesis: 1–3 causes, the most likely first.

## Commands

- `npm run dev` — dev server (http://localhost:3000)
- `npm run build` — next build
- `npm run check` — type-check + lint + format:check (`npm run format` writes)
- `npm run test` — Vitest
- `npm run test:e2e` — Playwright (needs the Docker services; reuses a running dev server or starts one)

Before reporting a task as done: `npm run check`, `npm run test`, `npm run build`, `npm run test:e2e`.

## Docs

- Before working in an area, read its document in docs/:
  - docs/architecture.md — structure, data flow, page pattern, shared UI
  - docs/url-state.md — URL state, URL hooks, canonical and legacy params, navbar cache
  - docs/filters.md — filter config, sections, containers, draft, availability
  - docs/backend.md — API routes, Redis, Solr, WorldClim, Wikidata, error handling
  - docs/localization-i18n.md — locales, translations, adding a language
  - docs/operations.md — Docker, env variables, Solr reindex, scripts, CI and deploy
  - docs/testing.md — Vitest, Playwright, test conventions
  - docs/pages.md — the page hook, PageLayout, the four pages, adding a page or a page block
  - docs/charts.md — series, kind rules, the chart model, chart section and blocks, exports
  - docs/colors.md — colour layers, series colours, contrast, adding a colour
  - docs/climate-indices.md — Walter-Lieth geometry and rules, arid / frost months, De Martonne
  - docs/export.md — export menu, SVG builders, export palette, PNG, raw data, heat map image
  - docs/city-search.md — city search: labels vs search names, analysis, the two clauses, ranking, limits
  - docs/heat-map.md — the heat map page: region, cell cap, strips, colour scales, stats
  - docs/settings.md — what is stored where, settings store, theme, animations, settings page
- A change that alters how an area works updates its document in the same task.
- Every task report lists the docs/ files changed.

## Git

- Never change git history, the index or the stash. The user stages and commits.
- Forbidden: git add, git rm (including --cached), git mv, git restore --staged, git reset, git stash, git commit, git checkout -- <path>, git clean. Move, rename and delete files with plain mv / rm.
- Read-only git commands (status, diff, log, show, ls-files) are fine.
- The user's commit format: `type(scope): message` — lowercase, present tense, imperative. Types: feat | fix | refactor | chore | docs | perf | style.

## Next.js rules

- Pages in src/app/ are default exports ending with "Page".
- Server components by default; "use client" only for hooks, events or the DOM.
- Components that read useSearchParams render inside a Suspense boundary.
- An app-wide hook that reads the URL needs a host component inside a Suspense boundary, since AppLayout sits above them all. The host only calls its hook and returns null, lives in src/layouts/ and is named for what it does (UrlSync hosts useFilterUrlSync).
- Leaflet components always use `dynamic(() => import(...), { ssr: false })`.
- localStorage / sessionStorage only inside effects or event handlers, never at render time.
- Route handlers in src/app/api/ for every external API call.
- The WorldClim API key is server-only (no NEXT_PUBLIC_ prefix).

## Environment variables

All env vars are validated in `src/libs/Env.ts`. Never read `process.env` or `import.meta.env` directly: import `env` from `@/libs/Env`, or app-wide values from `GLOBAL_CONFIG` in `src/libs/GlobalConfig.ts`.

## Architecture

- **Data flow (docs/architecture.md)**
  - Components consume hooks only; they never import services or `apiClient`.
  - Hooks reach external data only through /api routes, via `apiClient`, directly or through a client service (`WorldClimService`).
  - Services are plain objects with async methods: no hooks, no React.
  - Data fetching through useQuery / useMutation; WorldClim data with `staleTime: Infinity`.
- **URL and routing (docs/url-state.md)**
  - The URL is the single source of truth for filters and page view state.
  - Router calls only in: useFilterNavigation, useCanonicalFilterUrl, useUrlStateSync, useChartModeUrl, useNavbarNavigation, useLocaleSwitch. Nowhere else.
  - The locale is never in the URL. Use next/link and next/navigation directly.
  - Below lg, the filters sheet writes only after it has closed (`await closeSheet()` in useFiltersSheet).
  - The last-page-params store is written only by useLastPageParamsSync and read only by useNavbarNavigation at click time. Pages read the URL, never the store.
- **State (docs/architecture.md, docs/settings.md)**
  - TanStack Query for server state; the URL for filters and page view state; useState for UI-only state (open, hover, drafts).
  - Zustand (src/stores/) only for client state that isn't page state: settingsStore (every preference but the language), lastPageParamsStore, navigationIntentStore. Persisted cities use persistedLocationStores.
  - Never store derived data in state.
- **Page pattern (docs/pages.md, docs/charts.md)**
  - A page is a page hook in src/hooks/pages/ (everything that differs between pages), a one-line container calling it, and a view filling PageLayout.
  - Chart pages return TChartPageResult and draw their chart with ChartSection.
  - A view receives props and renders only.

## Components

- A component gets its own file if it's reused or encapsulates meaningful logic or markup. Single-use wrappers that only forward props or add a class are inlined into their caller.
- Organise by role, not platform: desktop and mobile differences are props or breakpoints of one component.
- Aim for ~100 lines per component and ~30 per function; don't split into pieces that mean nothing on their own.
- Shared UI primitives in src/components/UI/<ComponentName>/.
- One folder per feature (e.g. src/components/filters/), flat component files, one `<feature>.type.ts` and one `<feature>.constant.ts`. A sub-area gets its own only when large.
- index.ts only at feature level and for shared UI primitives.
- Presentational components: props only, no side effects, no data fetching.
- No business logic in components: extract it to hooks or utils.
- Event handler props `on…`; implementations `handle…`.
- Boolean props `is`, `has`, `can`, `should`.
- Before creating a component, search src/components/UI and the feature folders. If one fits with a small extension (an optional prop, a variant, a slot), extend it.
- Never duplicate an existing component under another name (a new picker when Dropdown fits, a new chip when Chip fits).
- Extensions stay generic: page-specific logic lives in the caller and comes in through props or slots. No flags only one page uses.
- Every task report lists new components, one line each on why no existing one fit.

### Shared UI components

Search these first; the code is the reference for their props. In src/components/UI/:

- Badge — `UI/Badge` — a non-interactive label in a tint set (Martonne, cell count, year).
- BottomSheet — `UI/BottomSheet` — a modal sheet from the bottom edge (with useSheetHistory).
- Button — `UI/Button` — the app's button.
- Chip — `UI/Chip` — every chip: toggle, filter value, all filters.
- ChipScroller — `UI/ChipScroller` — a row of chips scrolling sideways with faded ends.
- DotLabel — `UI/DotLabel` — a label with a colour dot.
- Dropdown — `UI/Dropdown` — the app's select; OptionDot (`UI/Dropdown/OptionDot`) is its dot.
- ExportMenu — `UI/ExportMenu` — the CSV / PNG / SVG / raw export menu.
- MiniMap — `UI/MiniMap` — a small Leaflet map of one or more locations.
- PageWrapper — `UI/PageWrapper` — a page's content width and padding.
- PairLayout — `UI/PairLayout` — "A, swap, B": two sides with a control between.
- Popover — `UI/Popover` — a trigger and a floating panel.
- SectionLabel — `UI/SectionLabel` — a small uppercase section title.
- StatCell — `UI/StatCell` — one stat of a stats bar.
- StatusMessage — `UI/StatusMessage` — a page's empty or error message, or a closable notice.
- SwapButton — `UI/SwapButton` — an icon button exchanging two sides.
- ToggleSwitch — `UI/ToggleSwitch` — a labelled on / off switch.
- Skeletons — `UI/ChartSkeleton`, `MapSkeleton`, `SidebarSkeleton`, `StatCardsSkeleton`, `TableSkeleton`, `TopbarSkeleton` — loading placeholders.

Outside UI/:

- Card — `components/Card` — the card and every in-flow framed block.
- CellCountBadge — `components/filters/CellCountBadge` — a heat map region's cell count.
- ChartLegend — `components/ChartLegend` — legend items with line / bar / marker swatches.
- ChartSection — `components/charts` — a chart page's chart section.
- PageHeader — `components/PageHeader` — every page's title and description.
- PageLayout — `components/page` — every page's frame.
- ScrollEdgeFades — `components/ScrollEdgeFades` — faded ends of a horizontal scroller.
- SegmentedControl — `components/SegmentedControl` — a one-of-n switch with a sliding pill.
- SeriesMarker — `components/SeriesMarker` — a series' marker (A dot, B square).
- ThemeRoot — `components/ThemeRoot` — keeps the `dark` class in step; mounted once in AppLayout.

## Glossary

One term per concept, in code, docs and reports:

- **series** — One monthly dataset drawn on a chart (a city, a climate period, a weather year). Not "data A", "period entry" or "multi-period".
- **series kind** — `city`, `climatePeriod` or `weatherYear` (ESeriesKind)
- **kind rules** — What a kind always means for the chart (SERIES_KIND_RULES)
- **pair** — Exactly two series, A and B
- **compared years** — The weather years compared on Compare Periods
- **chart mode** — Walter-Lieth or standard
- **layout** — Side by side or overlay; in code `split` / `overlay`
- **body** — How the chart card lays out its series: single, split or overlay
- **panel** — One series' chart in the side-by-side layout
- **expanded panel** — A panel shown across the whole card
- **side picker** — A panel's control choosing which series it shows
- **shading** — Which series the Walter-Lieth overlay hatches
- **chart model** — Everything a chart draws, derived from its series (deriveChartModel)
- **view state** — The chart's state from the URL (mode, layout, pair, shown series, filters)
- **features** — What a page enables on its chart (difference, side pickers, hidden blocks)
- **chart card** — The card holding the chart
- **chart section** — The export menu, the blocks above the card and the chart card together
- **chart block** — Something drawn under or around every chart (CHART_BLOCKS)
- **stats table** — Per-series stats above the chart card, with an optional difference column
- **values table** — The monthly °C / mm rows under a chart
- **stats bar** — One place's annual stats in a row of stat cells (a single chart, the heat map's profile)
- **difference** — Minuend minus the other series
- **page hook** — A page's hook in src/hooks/pages/, returning everything its view draws
- **summary / details** — The page regions before and after the main content
- **data state** — Loading, empty, error or ready (TDataState)
- **region** — The heat map's drawn box or polygon
- **strip** — One of the WorldClim requests a region is split into

## TypeScript

- Types only in `*.type.ts` files, never inline in components, utils, hooks or constants.
- Enums only in `*.enum.ts` files in `src/enums/`.
- Interfaces only when a class implements them; `type T…` for data shapes.
- Shared constants in `src/constants/*.constant.ts`; feature-only ones in the feature's `<feature>.constant.ts`. No constants declared inside components, hooks or utils.
- Utilities only in `*.util.ts` files.
- Naming: types `T` prefix (`TClimatePeriod`), enums `E` (`EButtonVariant`), component props `T…Props` (`TBadgeProps`), interfaces `I`.
- Never `as` for casting (`as const` is allowed): use type guards or generics.

## Conditional logic

Prefer object literals over if/else chains or switch statements.

```ts
// CORRECT
const SIZE_LABELS = [
  { maxBytes: 1_000, label: "small" },
  { maxBytes: Infinity, label: "large" },
] as const;
return SIZE_LABELS.find(({ maxBytes }) => bytes < maxBytes)?.label;
// WRONG: if (bytes < 1_000) return "small"; …
```

## Comments

- Comments explain why, not what; never restate the code.
- No narration or section-divider comments.
- Comment only non-obvious decisions, workarounds (with their reason) and public APIs whose behaviour isn't clear from types and names.
- Remove outdated comments in every file you touch.

## i18n

- Never hardcode user-facing strings: use next-intl (`useTranslations`).
- A change to keys updates all 10 locale files in the same change, with natural phrasing in each language.
- Restructuring keys is allowed: update every usage and every locale, and remove keys that become unused.

## Styling

Tailwind v4. Components are styled with Tailwind classes; CSS custom properties hold every design token. Every UI change works in light and dark mode.

### Colours (docs/colors.md)

- Colour values live only in src/styles/tokens.css.
- Components use semantic tokens (`--color-*`) only: never a primitive, a hex / rgb() / hsl() / oklch() value, a Tailwind palette class (`bg-green-100`, `text-white`) or a named colour. TS passes tokens as `"var(--color-…)"` strings.
- A series' colour comes from seriesColor.util (by position).
- Text below large-text size never takes a series colour (getSeriesTextColor).
- Files that can't read CSS (favicon, static logo, OG image, global-error) are an explicit allowlist, and their values must be primitives.
- tests/unit/styles/colorTokens.test.ts enforces these.

### Style files

- Global CSS lives in src/styles/, split by concern and imported by global.css, which holds only the imports (Tailwind first):
  - tokens.css — custom properties: colours, spacing, radii, shadows, z-index, both themes, @theme mappings
  - animations.css — keyframes, transitions, motion-off and reduced-motion rules
  - utilities.css — custom @utility and @custom-variant definitions (create it when it has content)
  - base.css — element-level base styles
  - <feature>.css — only for a third-party library's global overrides (leaflet.css)
- New tokens, animations or utilities go into the matching file, never into global.css or a component.
- A component's own class strings live beside it (its .constant.ts or .util.ts). A style pattern shared by several unrelated components becomes a Tailwind @utility in src/styles/utilities.css. Values are tokens in tokens.css.
- Remove tokens and keyframes that become unused.
