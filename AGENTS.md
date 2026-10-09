# AGENTS.md

## Principles

- Clarity and consistency over cleverness. Minimal changes. Match existing patterns.
- Reuse before creating: extend an existing component, hook or util before adding a
  new one (see "Reuse before creating components").
- TypeScript everywhere; no `any` unless isolated and necessary.
- No unnecessary `try/catch`. Avoid casting; use narrowing.
- Named exports only (no default exports, except Next.js pages).
- Absolute imports via `@/` unless same directory.
- Follow existing ESLint setup; don't reformat unrelated code.
- Let compiler infer return types unless annotation adds clarity.
- Options object for 3+ params, optional flags, or ambiguous args.
- Hypothesis-driven debugging: 1-3 causes, validate most likely first.

## Commands

- `npm run dev` — Next.js dev server (http://localhost:3000)
- `npm run build` — next build
- `npm run lint` — ESLint
- `npm run type-check` — tsc --noEmit
- `npm run format` — Prettier write
- `npm run check` — type-check + lint + format:check
- `npm run test` — Vitest unit tests
- `npm run test:e2e` — Playwright e2e tests (needs Docker services and dev server)

Before reporting a task as done: `npm run check`, `npm run test`, `npm run build`,
`npm run test:e2e`.

## Git

- Never commit, amend, stash, reset or otherwise change git history or the index.
  The user commits.
- Commit message format used by the user: `type(scope): message` — lowercase,
  present tense, imperative mood. Types: feat | fix | refactor | chore | docs | perf |
  style.

## Next.js Rules

- All pages in src/app/ are default exports ending with "Page"
- Add "use client" only when component uses hooks, events, or DOM
- Server components by default — client components only when needed
- Components that read useSearchParams render inside a Suspense boundary
- Leaflet components always use dynamic(() => import(...), { ssr: false })
- localStorage/sessionStorage access only inside effects or event handlers — never
  at render time
- Route Handlers in src/app/api/ for all external API calls
- WorldClim API key is server-only (no NEXT_PUBLIC_ prefix)

## Environment Variables

All env vars are validated in `src/env.ts` with Zod. Never read `process.env` or
`import.meta.env` directly — use `GLOBAL_CONFIG` from `src/global-config.ts`.

## Architecture

### Data Flow

Component → custom hook (src/hooks/) → client service → /api route handler →
Redis cache → Solr / WorldClim

- Components consume hooks only — never import services directly
- Hooks never call external APIs directly — always via /api/ routes
- Services are plain objects with async methods — no hooks, no React inside
- All data fetching via useQuery/useMutation with staleTime: Infinity for WorldClim

### URL and routing

- The URL is the single source of truth for filters and page view state.
- Router calls only in dedicated URL hooks: useFilterNavigation (filters),
  useUrlStateSync (page params), useChartModeUrl (chart mode),
  useNavbarNavigation (navbar and logo links) — nowhere else.
  - On mobile, writes from filter sheets happen only after the sheet has closed
    (`await closeSheet()`); a router call while a sheet is open drops its history
    marker.
- The last-page-params store is a cache for navbar links: written only by
  useLastPageParamsSync, read only by useNavbarNavigation at click time. Pages never
  read it; they read the URL.

### State

- TanStack Query — server/remote state
- URL search params — filters and page view state (chart mode, layout, selected
  periods/years, selected city)
- Zustand — client-only caches that are not page state (e.g. last page params)
- useState — UI-only (open/closed, hover, drafts)
- Never store derived data in state

### Page Pattern

Split every page into container (data + state) and view (pure rendering).
Container fetches, handles events. View receives props, renders only.

## Components

### Granularity

- A component gets its own file if it's reused, or encapsulates meaningful logic or
  markup. Single-use wrappers that only forward props or add a class are inlined
  into their caller.
- Organise by role, not by platform. Desktop and mobile differences are props or
  breakpoints of the same component, not separate component trees.
- Aim for ~100 lines per component and ~30 per function, but don't split a
  component just to meet the number if the pieces mean nothing on their own.

### Structure

- Shared UI primitives live in src/components/UI/<ComponentName>/.
- Features live in one folder per feature (e.g. src/components/filters/) with flat
  component files inside, plus one `<feature>.type.ts` and one
  `<feature>.constant.ts` for the whole feature. A sub-area gets its own type or
  constant file only when it's large enough to justify it.
- index.ts only at feature level and for shared UI primitives — not per component.

### Rules

- Presentational components: no side effects, props only
- No business logic inside components — extract to hooks or utils
- Event handler props: `on` prefix (onClick)
- Event handler implementations: `handle` prefix (handleClick)
- Boolean props: `is`, `has`, `can`, `should` prefix

## Reuse before creating components

- Before creating a component, search src/components/UI and the feature folders for
  one that already does the job. If one fits with a small extension (an optional
  prop, a variant, a slot), extend it instead of creating a new one.
- Creating a component that duplicates an existing one under a different name is
  not allowed (e.g. a new picker when Dropdown fits, a new chip when FilterChip
  fits).
- Extensions must stay generic: page- or feature-specific logic lives in the caller
  and is passed in via props or slots. Don't add flags that only one page uses.
- Every task report lists new components with one line each on why no existing
  component fit.

### Shared UI components

<catalog: one line per shared component — name, path, what it's for, key optional
props/variants>

## TypeScript — file placement

- Types: only in `*.type.ts` files. Never inline in components, utils, hooks or
  constants.
- Enums: only in `*.enum.ts` files in `src/enums/`.
- Interfaces: only when a class implements them. Use `type T...` for data shapes.
- Constants: shared ones in `*.constant.ts` in `src/constants/`; feature-only ones in
  the feature's `<feature>.constant.ts`. No constants declared inside components,
  hooks or utils.
- Utilities: only in `*.util.ts` files.

### Naming

- Types/unions: `T` prefix — `TClimatePeriod`
- Enums: `E` prefix — `EDataset`
- Component props: `Props` suffix — `ClimateChartProps`
- Interfaces (rare): `I` prefix — `IRepository`

### No type assertions

Never use `as` for casting. Use type guards or proper generics instead. `as const`
is allowed.

## Conditional Logic

Prefer object literals over if/else chains or switch statements.

```ts
// CORRECT
const THRESHOLDS = [
  { threshold: 5, result: "hyperarid" },
  { threshold: 10, result: "arid" },
  { threshold: Infinity, result: "perhumid" },
] as const;
return THRESHOLDS.find(({ threshold }) => value < threshold)?.result ?? null;

// WRONG
if (value < 5) return "hyperarid";
if (value < 10) return "arid";
```

## Comments

- Comments explain why, not what. Don't write comments that restate the code.
- No narration or section-divider comments.
- Keep comments only for non-obvious decisions, workarounds (with their reason) and
  public APIs whose behaviour isn't clear from types and names.
- Remove outdated comments in every file you touch.

## i18n

- Never hardcode user-facing strings — use next-intl (`useTranslations`).
- When adding or changing keys, update all 10 locale files in the same change, with
  natural phrasing in each language.
- Restructuring keys is allowed when needed; update every usage and every locale,
  and remove keys that become unused.

## Styling

Tailwind v4. Components are styled with Tailwind classes; CSS custom properties hold
all design tokens — never hardcode hex values in components. Every UI change must
work in light and dark mode.

### Style files

- All global CSS lives in src/styles/, split by concern, and is imported into
  global.css. global.css contains only imports (Tailwind first, then the partials)
  and nothing else.
- Suggested split (create a file only when it has content):
  - tokens.css — CSS custom properties: colours, spacing, radii, shadows, z-index,
    light and dark theme values, @theme mappings
  - animations.css — @keyframes, motion durations/easings, reduced-motion rules
  - utilities.css — custom @utility and @custom-variant definitions
  - base.css — element-level base styles (html, body, scrollbars, focus)
  - <feature>.css — only if a third-party library needs global overrides (e.g.
    Leaflet, Recharts)
- New tokens, animations or utilities go into the matching file, never directly into
  global.css or a component.
- Remove tokens and keyframes that become unused.
- TypeScript helpers that build class names stay in src/utils/*.util.ts.

## What NOT to Do

- Business logic inside components
- Data fetching in presentational components
- `any` type or `as` casting (except `as const`)
- Types/enums/interfaces declared outside dedicated files
- Inline object shapes in function signatures
- Importing services directly in components
- Magic strings or numbers
- Derived data stored in state
- Hardcoded user-facing strings
- Adding i18n keys to only some locales
- Reading process.env or import.meta.env directly
- Hardcoding hex color values
- Duplicating an existing component under a new name
- Single-use wrapper components that only forward props
- Comments that restate the code
- Committing or changing git history
