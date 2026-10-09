<div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
  <img src="./src/assets/climatica-logo.svg" alt="Climatica Logo" width="50" style="flex-shrink: 0;" />
  <h1 style="margin: 0; padding: 0; line-height: 1.2;">Climatica – Global Climate Explorer</h1>
</div>

**Climatica** is an interactive web application for exploring, analyzing, and comparing climate data worldwide.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Developer Setup](#developer-setup)
- [Documentation](#documentation)
- [License](#license)

---

## Features

- **City Climate** — search any city and see its climate as a Walter-Lieth diagram or a standard climograph, with an interactive map and key stats
- **Compare Cities / Compare Periods** — compare two cities, or one city across two periods, in side-by-side or overlaid charts, with a table of metrics showing the differences
- **Regional Heatmap** — draw a region on the map and analyze its climate distribution
- **Flexible Controls** — switch datasets (climate/weather), variables, grid resolution, and month filters
- **Multilingual** — English, French, German, Greek, Italian, Norwegian Bokmål, Portuguese, Romanian, Spanish, Ukrainian
- **Export** — save charts with stats information as SVG, PNG and download raw data as CSV or JSON

---

## Quick Start

### Requirements

- [Node.js LTS](https://nodejs.org/) (v18+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Python 3](https://www.python.org/downloads/) (for one-time data preparation and running Python unit tests)
  - On macOS/Homebrew Python, installing packages requires a virtual environment — `pip install` directly into the system Python will fail with `externally-managed-environment`. See the [Tests](#tests) section for the exact setup.

### Steps

**1. Clone and install:**

```bash
git clone <repository-url>
cd climatica-nextjs
npm install
```

**2. Create `.env` file** in the root folder:

```env
WORLDCLIM_API_KEY=your-worldclim-api-key
REDIS_URL=redis://localhost:6379
SOLR_URL=http://localhost:8983
```

**3. Download GeoNames city data** (one time only):

- [allCountries.zip](https://download.geonames.org/export/dump/allCountries.zip) (~400MB)
- [alternateNamesV2.zip](https://download.geonames.org/export/dump/alternateNamesV2.zip) (~200MB)

Extract both files into `docker/solr/data/`

**4. Generate cities CSV:**

```bash
python3 --version  # should be 3.8+
python3 docker/solr/scripts/prepare_data.py
```

**5. Start Docker services:**

```bash
npm run docker:up
```

Wait ~30 seconds for Solr to start, then:

**6. Import city data into Solr:**

```bash
npm run solr:reindex
```

This takes approximately 3 minutes since indexing should go through pretty large file.

**7. Start the app:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Useful commands

```bash
npm run docker:up       # Start Docker services
npm run docker:down     # Stop Docker services
npm run docker:reboot   # Reset and restart Docker services
npm run solr:reindex    # Re-import city data into Solr
npm run docker:logs     # View Docker logs
```

**Updating an existing Solr setup** (after pulling changes to the Solr files):

| When                                                                                | Run                                                            |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `docker/solr/solrconfig.xml` changed, or the `cities` core fails to load            | `npm run docker:reboot` (recreates the core; also wipes Redis) |
| `src/configs/locales.json` or `prepare_data.py` changed (`cities.csv` isn't in git) | `python3 docker/solr/scripts/prepare_data.py`                  |
| `docker/solr/schema.json` changed, or after any of the above                        | `npm run solr:reindex`                                         |

Solr copies `solrconfig.xml` into the core only when the core is first created, so a
config change needs the reboot; `solr:reindex` applies `schema.json` and reimports the
CSV. `generate_schema.py` is only needed by whoever edits `locales.json` (see
[Adding a new locale](#adding-a-new-locale)) — its output is committed.

---

### Tests

```bash
npm run test              # run unit tests
npm run test:coverage     # unit tests with coverage report
npm run test:e2e          # E2E tests (requires Docker running; starts its own dev server)
npm run test:e2e:ui       # E2E tests with Playwright UI
```

Unit tests cover: Redis client, caching strategies, cities route,
WorldClim routes, SolrService, WorldClimService, URL utils, city descriptions,
locale key parity.

E2E tests cover: city search, climate data loading, i18n switching,
navigation, 404 page.

Playwright starts `npm run dev` itself on `PORT` (default 3000) and reuses a dev
server that is already running there (except in CI). It still needs Solr and
Redis up (`npm run docker:up`) and network access to WorldClim.

**Python unit tests** (`docker/solr/scripts/prepare_data.py`):

```bash
python3 -m venv .venv          # first time only
source .venv/bin/activate
pip install -r docker/solr/scripts/requirements-dev.txt
pytest docker/solr/scripts/
deactivate                     # when done
```

Cover: per-language label fallback order in `build_labels()` (including the
`uk`-specific fallback to `label_en`), alternate-name preference resolution
in `should_update_name()`, and locale-list loading/validation in
`load_lang_order()`. Runs against small in-memory/tmp_path fixtures, not the
real GeoNames dump — no download required.

---

## Developer Setup

### Tech Stack

| Technology        | Purpose                           |
| ----------------- | --------------------------------- |
| Next.js 16        | Full-stack framework (App Router) |
| React 19          | UI framework                      |
| TypeScript        | Type safety                       |
| TanStack Query v4 | Data fetching & caching           |
| Zustand v5        | Client state                      |
| Tailwind CSS v4   | Styling                           |
| Leaflet           | Interactive maps                  |
| Recharts          | Charts                            |
| next-intl         | Multilingual support              |
| Solr 8            | City search database              |
| Redis 7           | Server-side caching               |
| ioredis           | Redis client                      |

### Project Structure

```
climatica-next-app/
├── docker/
│   ├── solr/
│   │   ├── data/           # GeoNames data files (gitignored)
│   │   ├── scripts/        # prepare_data.py, generate_schema.py, test_prepare_data.py
│   │   ├── schema.json     # Solr schema
│   │   └── solrconfig.xml  # Solr configuration
│   └── docker-compose.yml
├── src/
│   ├── app/
│   │   ├── api/            # Next.js Route Handlers (server proxy)
│   │   │   ├── cities/     # City search → Redis → Solr
│   │   │   └── worldclim/  # WorldClim API proxy
│   │   ├── climate-statistics/
│   │   ├── compare-cities/
│   │   ├── compare-periods/
│   │   └── heat-map/
│   ├── components/         # Shared UI components
│   ├── configs/            # locales.json — json for supported locales
│   ├── hooks/              # Custom React hooks
│   ├── libs/
│   │   ├── api/            # Axios client
│   │   ├── redis/          # Redis client + caching strategies
│   │   └── services/       # Solr, Wikidata, WorldClim services
│   ├── constants/
│   ├── types/
│   └── utils/
```

### Data Flow

```
Component → Hook → client service → apiClient → /api/* Route Handler → Redis → Solr / WorldClim / Wikidata
```

- Components call hooks only; hooks call the client services (`WorldClimService`)
  or `apiClient` — an axios instance on the same origin (50 s timeout), never `fetch`
- The browser only talks to the app's own `/api/*` routes; `SolrService` and
  `WikidataService` are server-only and used by the route handlers
- Redis caches (in the route handlers):

  | What                                            | TTL                                                                                                                           |
  | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
  | City search (`/api/cities?q=<text>`)            | 7 days; 1 day for queries under 4 characters; 30 days once a query has been fetched from Solr 10 times                        |
  | Nearest city (`/api/cities?q=<lat>,<lng>`)      | 7 days                                                                                                                        |
  | WorldClim resources (`/api/worldclim/resource`) | 7 days; 30 days once fetched 5 times                                                                                          |
  | WorldClim queries (`/api/worldclim/<id>`)       | not cached in Redis — the browser's TanStack Query cache keeps them (never stale; dropped 5 min after no component uses them) |

  Empty results and upstream errors are never cached. A failing upstream is
  answered with an error status (Solr: 503, WorldClim and Wikidata: 502), not
  with an empty or error body as data.

- Rate limits: 1000 requests per minute per IP, counted separately for
  `/api/cities`, `/api/worldclim/<id>` and `/api/worldclim/resource`; over the
  limit the route answers 429 with `Retry-After`. If Redis is down the limit is
  not enforced.
- WorldClim API key stays server-side only

### Adding a new locale

`src/configs/locales.json` is the single source of truth for supported
locales — the frontend (`src/constants/locales.constant.ts`), the CSV
generator (`prepare_data.py`), and the Solr schema generator
(`generate_schema.py`) all read from it. Adding a language means touching
this one file plus regenerating two derived artifacts:

```bash
# 1. Add the locale code to src/configs/locales.json

# 2. Regenerate the Solr schema (adds label_<lang> + label_<lang>_ngram fields)
python3 docker/solr/scripts/generate_schema.py

# 3. Regenerate the cities CSV (adds the label_<lang> column)
python3 docker/solr/scripts/prepare_data.py

# 4. Push the new schema to Solr and reimport the data
npm run solr:reindex
```

`schema.json` is committed to the repo but treated as a build artifact of
`generate_schema.py` — don't hand-edit the per-locale fields directly, since
the next regeneration will overwrite them. Run `git diff docker/solr/schema.json`
after step 2 to confirm the change is only additive before reindexing.

### Code Standards

- Types: `T` prefix — `TClimatePeriod`
- Enums: `E` prefix — `EDataset`
- Constants: `*.constant.ts`
- Types: `*.type.ts`
- Utils: `*.util.ts`

```bash
npm run check   # type-check + lint + format
```

### External APIs

**WorldClim** — `https://scrapi.gsic.uva.es/apis/worldclim`

- Auth: Bearer token (`WORLDCLIM_API_KEY`)
- Global climate & weather grids (1951–2024)

**Wikidata** — `https://www.wikidata.org/w/api.php`

- Used only for reverse geocoding (coordinate → nearest city)

**GeoNames** — one-time data import into local Solr

- Source: [geonames.org](https://www.geonames.org/)

---

## Documentation

Developer documentation lives in [`docs/`](docs):

- [architecture.md](docs/architecture.md) — folder structure, data flow, the container/view page pattern, where shared UI lives
- [url-state.md](docs/url-state.md) — the URL as the source of truth, the URL hooks, canonical and legacy params, the navbar's last-page-params cache
- [filters.md](docs/filters.md) — FILTERS_CONFIG, sections and containers, draft and auto-apply, availability, adding a filter
- [backend.md](docs/backend.md) — API routes, Redis caching and rate limits, Solr, WorldClim proxy, Wikidata, known issues
- [i18n.md](docs/i18n.md) — locales, next-intl usage, key conventions, adding a language (app and Solr)
- [operations.md](docs/operations.md) — Docker services, environment variables, Solr reindex, updating an environment
- [testing.md](docs/testing.md) — Vitest and Playwright setup, mobile scenarios, test conventions

---

## License

Licensed under the terms in the [LICENSE](LICENSE) file.

**Author**: Andrii Kononenko [wastxrq] — wastardy.k@gmail.com
