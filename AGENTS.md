# CLAUDE.md

## Principles

- Clarity and consistency over cleverness. Minimal changes. Match existing patterns.
- Keep components/functions short; break down when it improves structure.
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

## Next.js Rules

- All pages in src/app/ are default exports ending with "Page"
- Add "use client" only when component uses hooks, events, or DOM
- Server components by default — client components only when needed
- Never read process.env directly — use validated src/env.ts
- Leaflet components always use dynamic(() => import(...), { ssr: false })
- localStorage access only inside useEffect — never at render time
- Route Handlers in src/app/api/ for all external API calls
- WorldClim API key is server-only (no NEXT*PUBLIC* prefix)

## Environment Variables

All env vars validated in `src/env.ts` with Zod. Never read `process.env`
or `import.meta.env` directly — always use `GLOBAL_CONFIG` from
`src/global-config.ts`.

## Architecture

### Data Flow

Component → custom hook (src/hooks/) → Service (src/api/services/) → axiosInstance

- Components consume hooks only — never import services directly
- Services are plain objects with async methods — no hooks, no React inside
- All data fetching via useQuery/useMutation with staleTime: Infinity for WorldClim

### State

- TanStack Query — server/remote state
- Zustand — persisted auth + user info
- URL search params — filters, active tab, selected city
- useState — UI-only (open/closed, hover)
- Never store derived data in state

### Page Pattern

Split every page into container (data + state) and view (pure rendering).
Container fetches, handles events. View receives props, renders only.

## TypeScript — STRICT FILE PLACEMENT RULES

These rules are non-negotiable. Violations must be fixed before committing.

TYPES: Declare ONLY in `*.type.ts` files. Never inline in components,
utils, hooks, or constants. Export from `.type.ts`, import where needed.

ENUMS: Declare ONLY in `*.enum.ts` files in `src/enums/`.

INTERFACES: Only when a class implements it. Use `type T...` for data shapes.

CONSTANTS: Declare ONLY in `*.constant.ts` files in `src/constants/`.

UTILITIES: Declare ONLY in `*.util.ts` files.

WRONG — never do this:
// inside MyComponent.tsx or myUtil.ts
type TMyThing = { ... }; // NO
interface IMyThing { ... } // NO
enum EMyEnum { ... } // NO
const MY_CONSTANT = "value"; // NO (if reused elsewhere)

CORRECT:
// MyComponent.type.ts
export type TMyThing = { ... };

// myEnum.enum.ts
export enum EMyEnum { ... }

// myConstant.constant.ts
export const MY_CONSTANT = "value";

### Naming

- Types/unions: `T` prefix — `TClimatePeriod`
- Enums: `E` prefix — `EDataset`
- Component props: `Props` suffix — `ClimateChartProps`
- Interfaces (rare): `I` prefix — `IRepository`

### No type assertions

Never use `as`. Use type guards or proper generics instead.

## Components

Folder structure — required:
ComponentName/
ComponentName.tsx
ComponentName.type.ts
ComponentName.util.ts (if needed)
ComponentName.constant.ts (if needed)
index.ts

Rules:

- Max ~100 lines per component, ~30 lines per function
- Presentational components: no side effects, props only
- No business logic inside components — extract to hooks or utils
- Event handler props: `on` prefix (onClick)
- Event handler implementations: `handle` prefix (handleClick)
- Boolean props: `is`, `has`, `can`, `should` prefix

## Conditional Logic

Prefer object literals over if/else chains or switch statements.

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

## i18n

- Never hardcode user-facing strings — always use useTranslation
- When adding new keys: update ALL THREE locale files (en, es, uk)
- Never restructure existing translation files — only extend

## Styling

Tailwind v4. CSS custom properties for all design tokens — never hardcode
hex values in components.

## Git Commits

Format: `type(scope): message` — lowercase, present tense, imperative mood
Types: feat | fix | refactor | chore | docs | perf | style

## What NOT to Do

- Business logic inside components
- Data fetching in presentational components
- `any` type or `as` casting
- Types/enums/interfaces declared outside dedicated files
- Inline object shapes in function signatures
- Importing services directly in components
- Magic strings or numbers
- Derived data stored in state
- Hardcoded user-facing strings
- Adding i18n keys to only one locale
- Reading process.env or import.meta.env directly
- Hardcoding hex color values
