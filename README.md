<div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
  <img src="./src/assets/climatica-logo.svg" alt="Climatica Logo" width="50" style="flex-shrink: 0;" />
  <h1 style="margin: 0; padding: 0; line-height: 1.2;">Climatica – Global Climate Explorer</h1>
</div>

**Climatica** is an interactive web application for exploring, analyzing, and comparing climate data worldwide.

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Features](#features)
- [Quick Start](#quick-start)
  - [Requirements](#requirements)
  - [Steps](#steps)
  - [Useful commands](#useful-commands)
  - [Tests](#tests)
- [Developer Setup](#developer-setup)
- [Tech Stack](#tech-stack)
  - [External APIs](#external-apis)
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

- [Node.js](https://nodejs.org/) 22.13.1, the version in [`.nvmrc`](.nvmrc) (`nvm use` picks it up)
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
npm run solr:recreate-core # recreate the Solr core from the repository's solrconfig.xml
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
npm run test          # unit tests (Vitest)
npm run test:coverage # unit tests with coverage
npm run test:e2e      # e2e tests (Playwright; needs Solr and Redis running)
npm run test:python   # Python tests for the data preparation (needs .venv, see below)
```

First-time setup for the Python tests:

```bash
python3 -m venv .venv
.venv/bin/pip install -r docker/solr/scripts/requirements-dev.txt
```

What each suite covers and how to write tests is in [docs/testing.md](docs/testing.md).

---

## Developer Setup

## Tech Stack

| Technology        | Purpose                           |
| ----------------- | --------------------------------- |
| Next.js 16        | Full-stack framework (App Router) |
| React 19          | UI framework                      |
| TypeScript        | Type safety                       |
| TanStack Query v4 | Data fetching and caching         |
| Zustand v5        | Client state                      |
| Tailwind CSS v4   | Styling                           |
| Leaflet           | Interactive maps                  |
| Recharts          | Charts                            |
| next-intl         | Multilingual support              |
| Solr 8            | City search                       |
| Redis 7           | Server-side caching               |

### External APIs

- **WorldClim** (`https://scrapi.gsic.uva.es/apis/worldclim`): global climate and weather grids;
  bearer token `WORLDCLIM_API_KEY`, server-side only.
- **Wikidata**: reverse geocoding (coordinates → nearest place).
- **GeoNames**: the one-time city import into Solr.

Code rules are in [AGENTS.md](AGENTS.md); `npm run check` runs type-check, lint and format.

---

## Documentation

Developer documentation is in [`docs/`](docs); [docs/README.md](docs/README.md) lists every
document. Good places to start:

| Document                                          | What it covers                |
| ------------------------------------------------- | ----------------------------- |
| [architecture.md](docs/architecture.md)           | app architecture and flow     |
| [pages.md](docs/pages.md)                         | how pages are built           |
| [charts.md](docs/charts.md)                       | how charts are built          |
| [url-state.md](docs/url-state.md)                 | shareable URLs and filters    |
| [localization-i18n.md](docs/localization-i18n.md) | locales and adding a language |
| [operations.md](docs/operations.md)               | Docker, Solr, deploy          |

Code rules for contributors and AI agents are in [AGENTS.md](AGENTS.md).

---

## License

Licensed under the terms in the [LICENSE](LICENSE) file.

**Author**: Andrii Kononenko [wastxrq] — wastardy.k@gmail.com
