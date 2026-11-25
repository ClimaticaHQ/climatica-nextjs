# Operations

Running the app locally and keeping an environment current: Docker services, environment
variables, the Solr city index, npm scripts, OpenStreetMap's tile policy, CI and deployment.

## Docker services

[`docker/docker-compose.yml`](../docker/docker-compose.yml) (project `climatica`):

| Service           | Image            | Port | Data                                                                                             |
| ----------------- | ---------------- | ---- | ------------------------------------------------------------------------------------------------ |
| `climatica-solr`  | `solr:8`         | 8983 | volume `solr_data`; creates the `cities` core on first start with the repo's `solrconfig.xml`    |
| `climatica-redis` | `redis:7-alpine` | 6379 | volume `redis_data`, append-only; `maxmemory` `REDIS_MAXMEMORY` (default `512mb`), `allkeys-lru` |

`docker:up` starts them, `docker:stop` / `docker:down` stop them (volumes kept), `docker:reset`
removes containers **and volumes**, `docker:reboot` resets and starts (then reindex),
`docker:logs` follows the logs.

## Environment variables

Validated at startup in [`src/libs/Env.ts`](../src/libs/Env.ts); copy
[`.example.env`](../.example.env) to `.env`. Code reads `env` from `@/libs/Env`, never `process.env`.

| Variable                  | Side   | Default                         | Purpose                                              |
| ------------------------- | ------ | ------------------------------- | ---------------------------------------------------- |
| `WORLDCLIM_API_KEY`       | server | required                        | WorldClim bearer key, never sent to the browser      |
| `REDIS_URL`               | server | `redis://localhost:6379`        |                                                      |
| `SOLR_URL`                | server | `http://localhost:8983`         | also used by `solr:schema`                           |
| `PORT`                    | server | `3000`                          | dev port; the server-side axios base URL             |
| `NEXT_PUBLIC_SITE_URL`    | client | `https://climatica.gsic.uva.es` | absolute URLs: metadata, share links, OG images      |
| `NEXT_PUBLIC_APP_VERSION` | client | set by `next.config.ts`         | package.json's version (About page); not set by hand |
| `NEXT_PUBLIC_GA_ID`       | client | empty                           | GA4 measurement ID; empty: no analytics at all       |

`NODE_ENV` isn't set by hand: Next sets it.

### Google Analytics ID

`NEXT_PUBLIC_*` values are inlined into the bundle when `next build` runs, so the ID must be present
where the build runs: the self-hosted runner. It comes from the committed
[`.env.production`](../.env.production) (public values only), which `next build` and `next start`
read and `next dev` doesn't. Keep it out of `.env` and `.example.env`: local dev, the tests and CI
build without it, so they load no analytics code and show no consent banner or Settings row. A
value in the shell wins over the file, even an empty one (the e2e servers pass `""`). Consent and
what loads when: [settings.md](settings.md#analytics-consent).

**Page views: the one event of our own.** gtag sends no automatic page view
(`send_page_view: false`) and the property's "page changes based on browser history events" is
off: Climatica's URL changes on every filter, chart mode or place, which would count one page many
times. [`useGaPageViews`](../src/hooks/ui/useGaPageViews.ts) sends exactly one `page_view` per
pathname, the first right after consent, and never the same pathname twice in a row
(`gaPageViewTracker`: Strict Mode, remounts, consent or language changes resend nothing). Before each it sets `page_location` and `page_referrer`
to origin + path ([`getPageUrl`](../src/utils/analyticsConsent.util.ts)) and `page_title` to the
page's English name (`GA_PAGE_TITLES`, never `document.title`, which names the place), so
nothing sent to Google carries a query string, a hash or a place — enhanced-measurement events
(scrolls, outbound clicks, downloads, form interactions) included. No other custom events.

**English only.** Every value our code sets on GA hits — the page names now, anything added
later — comes from English constants, never from translated messages, whatever the UI language:
one name per page in the reports.

**App language.** After consent, the interface's locale code (`en`, `de`, `uk`…) is set as the user
property `app_language` before the first page view, and again on a language switch
([`useGaAppLanguage`](../src/hooks/ui/useGaAppLanguage.ts)). Register it in the GA property as a
custom dimension, user scope, or it won't appear in reports. GA's own Language dimension is the
browser's language (gtag sends it itself), not the app's.

## First-time setup

1. `npm install`; create `.env`.
2. Download GeoNames' [`allCountries.zip`](https://download.geonames.org/export/dump/allCountries.zip)
   and [`alternateNamesV2.zip`](https://download.geonames.org/export/dump/alternateNamesV2.zip) into
   `docker/solr/data/` (gitignored).
3. `python3 docker/solr/scripts/prepare_data.py` — builds `cities.csv` (populated places and
   capitals; a label column per locale and a search-names column, [city-search.md](city-search.md#index)).
4. `npm run docker:up`; wait for Solr's healthcheck.
5. `npm run solr:reindex` (a few minutes).
6. `npm run dev`.

## Solr reindex

`npm run solr:reindex` = `solr:schema` (applies only what differs between
[`schema.json`](../docker/solr/schema.json) and Solr's schema; safe to repeat) + `solr:import`
(posts `cities.csv`, splitting `names` on `|`). `schema.json` is generated from `locales.json` by
`generate_schema.py` and committed.

## After pulling changes

| What changed                                                                     | Run                                            |
| -------------------------------------------------------------------------------- | ---------------------------------------------- |
| `solrconfig.xml`, `schema.json`, `generate_schema.py`, or the core fails to load | rebuild the city index (below)                 |
| `src/configs/locales.json` or `prepare_data.py`                                  | `prepare_data.py`, then `npm run solr:reindex` |
| the search query (`solr.util.ts`, `solr.constant.ts`)                            | `npm run cache:clear-city-search`              |
| `.example.env`                                                                   | add the new variable to `.env`                 |

### Rebuilding the city index

A core keeps the `solrconfig.xml` it was created with, and `solr:schema` never removes fields, so
a change to field types, the config or the CSV's columns needs a new core:

1. `prepare_data.py`, if the inputs changed or `cities.csv` is missing.
2. `npm run solr:recreate-core` — checks the image has the ICU libraries, then unloads and
   recreates the `cities` core from the repo's `solrconfig.xml`. It copies the file in because the
   container's configset is a single-file bind mount, which keeps reading the old file after a
   checkout. Redis is untouched.
3. `npm run solr:reindex`.
4. `npm run cache:clear-city-search` (and `cache:clear-nearest-city` after a core or data change).
   Never delete `city-search-counter:*`: the counters decide which queries earn the longer cache
   ([backend.md](backend.md#redis-caching)).

Search is empty or partial from step 2 until the import commits. Other cached responses survive
deploys; after a change to what an API returns, `docker exec climatica-redis redis-cli FLUSHDB`
(this also resets rate-limit and popularity counters).

## npm scripts

| Script                                                | Does                                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| `dev`, `build`, `start`                               | Next.js                                                                      |
| `preview`                                             | build, then serve it on 3100 beside the dev server                           |
| `check`                                               | type-check, lint, format check (`format` fixes formatting)                   |
| `test`, `test:watch`, `test:coverage`                 | Vitest ([testing.md](testing.md))                                            |
| `test:e2e`, `test:e2e:ui`, `test:e2e:debug`           | Playwright; needs the Docker services                                        |
| `test:e2e:prod`                                       | Playwright on a fresh production build, port 3100 ([testing.md](testing.md)) |
| `test:python`                                         | the Solr data script's pytest suite (`.venv`)                                |
| `cache:clear-city-search`, `cache:clear-nearest-city` | delete `city-search:*` / `nearest-city:*` (not counters)                     |
| `bench`                                               | cold vs. cached API timings ([README](../scripts/benchmark/README.md))       |

Node's version is [`.nvmrc`](../.nvmrc), read locally and by CI; npm's is `packageManager`. The
lock must be written by that npm: npm 10's `npm ci` rejects a lock written by npm 11 that omits an
optional peer dependency.

## OpenStreetMap tile usage policy

Only the browser asks OSM for anything: map tiles on every map and the heat map export's tile
fetches. The server makes no OSM request (no tiles, no Nominatim), so no User-Agent of ours is
involved; a future server-side OSM request must send one identifying the app and a contact.

- **One tile source:** `MAP_TILE_CONFIG` ([`map.constant.ts`](../src/constants/map.constant.ts)):
  URL, attribution, referrer policy. Changing the provider is one edit there.
- **Referer:** every response sends `Referrer-Policy: strict-origin-when-cross-origin`
  (`REFERRER_POLICY`, [`referrerPolicy.constant.ts`](../src/constants/referrerPolicy.constant.ts),
  set in `next.config.ts`); each tile layer and export fetch sets it too, so OSM gets our origin.
  A proxy in front must not replace it with `no-referrer`.
- **Caching:** tiles use the browser's default cache; nothing sends `no-cache`.
- **Attribution:** "© OpenStreetMap" on every map (the mini map's too) and in the heat map export.
- Guarded by [`osmTiles.e2e.ts`](../tests/e2e/osmTiles.e2e.ts) (tiles answered locally).

## CI and deployment

Three workflows in [`.github/workflows/`](../.github/workflows), sharing
[`setup-project`](../.github/actions/setup-project/action.yml):

| Workflow   | Runs on                                    | Does                                                                                              |
| ---------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Validation | every push and pull request                | type check, lint, format check, build                                                             |
| Tests      | pushes and PRs to `development` and `main` | unit tests with coverage; Solr, Redis, schema, Python tests and a GeoNames import (no Playwright) |
| Deploy     | after both pass on `main`, or by hand      | below                                                                                             |

The deploy job runs on a self-hosted runner on the production server and deploys a commit once,
only after both workflows passed for it. It compares the commit with the last deployed one in
three path groups (all count as changed without a previous deploy):

| Group        | Files                                                                               | Deploy does                                                  |
| ------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Solr core    | `schema.json`, `generate_schema.py`, `solrconfig.xml`                               | recreate the core, reindex, drop searches and nearest cities |
| City data    | `prepare_data.py`, `locales.json`                                                   | regenerate `cities.csv`, reindex, drop the same caches       |
| Search logic | `solr.util.ts`, `solr.constant.ts`, `solrService.ts`, `src/app/api/cities/route.ts` | drop cached searches                                         |

### Deploy steps

```mermaid
flowchart TD
  data{"City data changed<br/>or cities.csv missing?"} -- yes --> prepare["prepare_data.py"]
  data -- no --> core{"Core changed or missing?"}
  prepare --> core
  core -- yes --> recreate["npm run solr:recreate-core"]
  core -- no --> index{"Core or data changed,<br/>or core empty?"}
  recreate --> index
  index -- yes --> reindex["npm run solr:reindex"]
  index -- no --> build["npm ci · npm run build"]
  reindex --> build
  build --> restart["restart the climatica service<br/>then drop the affected cache keys"]
```

- Before these, the job resets to `origin/main`, detects the changed groups and starts the Docker
  services if they're down; a missing core counts as changed. The reindex fails the deploy if the
  core is still empty.
- The build comes last before the restart because `next build` rewrites `.next/` under the
  running server, so the broken window is the build alone.
- Cache keys are dropped after the restart, so the old app can't re-cache an old result.

While the core is recreated and reindexed the old app serves, with empty or partial search. Building `cities.csv` needs up
to ~2 GB of memory beside Solr, Redis and the app. The deploy never touches `.env`.
