# Operations

Running the app locally and keeping an environment up to date: the Docker services, the
environment variables, the Solr city index, the npm scripts, and how CI tests and deploys
`main`.

## Docker services

[`docker/docker-compose.yml`](../docker/docker-compose.yml) runs two services (project
`climatica`):

| Service           | Image            | Port | Data                                                                                                                                                   |
| ----------------- | ---------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `climatica-solr`  | `solr:8`         | 8983 | Volume `solr_data`. Creates the `cities` core on first start; [`solrconfig.xml`](../docker/solr/solrconfig.xml) is mounted into the default configset. |
| `climatica-redis` | `redis:7-alpine` | 6379 | Volume `redis_data`, with append-only persistence.                                                                                                     |

| Command                               | Does                                                                                |
| ------------------------------------- | ----------------------------------------------------------------------------------- |
| `npm run docker:up`                   | Starts both services (reads `.env`).                                                |
| `npm run docker:stop` / `docker:down` | Stops them / stops and removes the containers. Volumes are kept.                    |
| `npm run docker:reset`                | `down -v`: removes the containers **and both volumes** (Solr index and Redis data). |
| `npm run docker:reboot`               | `docker:reset` then `docker:up`. Needs a reindex afterwards.                        |
| `npm run docker:logs`                 | Follows the services' logs.                                                         |
| `npm run docker:rm`                   | Force-removes both containers.                                                      |

## Environment variables

They're validated at startup in [`src/libs/Env.ts`](../src/libs/Env.ts). Copy
[`.example.env`](../.example.env) to `.env` and fill it in.

| Variable               | Side   | Default                         | Purpose                                                      |
| ---------------------- | ------ | ------------------------------- | ------------------------------------------------------------ |
| `WORLDCLIM_API_KEY`    | server | — (required)                    | Bearer key for the WorldClim API; never sent to the browser. |
| `REDIS_URL`            | server | `redis://localhost:6379`        | Redis connection.                                            |
| `SOLR_URL`             | server | `http://localhost:8983`         | Solr base URL (also used by `npm run solr:schema`).          |
| `PORT`                 | server | `3000`                          | Dev server port; the server-side axios base URL uses it.     |
| `NODE_ENV`             | server | `development`                   |                                                              |
| `NEXT_PUBLIC_SITE_URL` | client | `https://climatica.gsic.uva.es` | Absolute URLs: metadata, share links, OG images.             |

Code never reads `process.env` directly; it imports `env` from `@/libs/Env`.

## First-time setup

1. `npm install`, then create `.env` as above.
2. Download GeoNames' [`allCountries.zip`](https://download.geonames.org/export/dump/allCountries.zip)
   and [`alternateNamesV2.zip`](https://download.geonames.org/export/dump/alternateNamesV2.zip)
   and extract both into `docker/solr/data/` (they're gitignored).
3. Build the cities CSV: `python3 docker/solr/scripts/prepare_data.py` (Python 3.8+). It
   keeps populated places and capitals (feature codes `PPL*`, `PPLC`) and writes one
   `label_<lang>` column per locale and a `names` column of search names
   ([backend.md](city-search.md#display-labels-and-search-names)).
4. `npm run docker:up`, and wait until Solr answers (its healthcheck pings the `cities`
   core).
5. `npm run solr:reindex`, which takes a few minutes for the full file.
6. `npm run dev` and open http://localhost:3000.

## Solr reindex

`npm run solr:reindex` runs two steps:

- **`solr:schema`** — [`apply-schema.mjs`](../docker/solr/scripts/apply-schema.mjs)
  compares [`schema.json`](../docker/solr/schema.json) with Solr's current schema and sends
  only the missing or changed field types, fields and copy fields. It's safe to run
  repeatedly, and fails with a clear message if Solr isn't reachable.
- **`solr:import`** — copies `docker/solr/data/cities.csv` into the container and posts it
  to the `cities` core, splitting the `names` column on `|` into values
  (`f.names.split=true&f.names.separator=%7C`).

`schema.json` is generated from `locales.json` by
[`generate_schema.py`](../docker/solr/scripts/generate_schema.py) and committed; only
whoever changes the locale list runs the generator (see [localization-i18n.md](localization-i18n.md)).

## Updating an existing environment

After pulling changes:

| What changed                                                                                   | Run                                                                        |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `docker/solr/solrconfig.xml`, `schema.json` or `generate_schema.py`, or the core fails to load | rebuild the city index (below)                                             |
| `src/configs/locales.json` or `prepare_data.py` (`cities.csv` isn't in git)                    | `python3 docker/solr/scripts/prepare_data.py`, then `npm run solr:reindex` |
| the search query (`solr.util.ts`, `solr.constant.ts`)                                          | `npm run cache:clear-city-search`                                          |
| `.example.env` (a new variable)                                                                | add it to `.env`                                                           |

### Rebuilding the city index

A change to the field types, `solrconfig.xml` or the CSV's columns needs a new core. A core keeps
the copy of `solrconfig.xml` it was created with, so a reload never picks up a change, and
`solr:schema` only adds or replaces fields, never removes old ones. This is also the manual
fallback on the server when a deploy failed half way:

1. `python3 docker/solr/scripts/prepare_data.py` — regenerate `cities.csv`, if the data inputs
   changed or it's missing.
2. `npm run solr:recreate-core` —
   [`recreate-core.sh`](../docker/solr/scripts/recreate-core.sh) checks that the Solr image has
   the ICU libraries `solrconfig.xml` loads, unloads the `cities` core with its index and
   instance directory, and creates it again, empty, from the repository's `solrconfig.xml`. It
   copies the file in rather than relying on the container's configset, which is a single-file
   bind mount: replacing the file on the host (a `git checkout` or `git reset`) leaves a running
   container reading the old one. Redis isn't touched, unlike `npm run docker:reboot`.
3. `npm run solr:reindex` — apply `schema.json` and import the CSV.
4. `npm run cache:clear-city-search` — delete the cached search results (`city-search:*`),
   computed by the old index; after a change to the core or the data also
   `npm run cache:clear-nearest-city` (`nearest-city:*`). Never delete `city-search-counter:*`:
   the counters record how often each query is looked up, which decides when its results earn
   the longer cache time ([backend.md](backend.md#redis-caching)). Climate data keys are never
   affected by a search change.

Search is unavailable (empty or partial results) from step 2 until the import in step 3 has
committed. On the full index the recreate takes about 2 s and the reindex about 2¼ minutes
locally.

Cached responses survive in Redis across deploys (city searches up to 30 days, see
[backend.md](backend.md)). After a change to city search, delete the cached results as in step 4. After any other change that alters what an API returns, clear them with
`docker exec climatica-redis redis-cli FLUSHDB` (it also resets the rate-limit and popularity
counters), or reboot the services.

## npm scripts

Besides the Docker and Solr scripts above, from [`package.json`](../package.json):

| Script                                              | Does                                                                                                 |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm run dev`                                       | Next.js dev server on `PORT` (3000)                                                                  |
| `npm run build`, `npm run start`                    | production build, and serving it                                                                     |
| `npm run check`                                     | `type-check` (tsc), `lint` (ESLint) and `format:check` (Prettier); `npm run format` fixes formatting |
| `npm run test`, `test:watch`, `test:coverage`       | Vitest ([testing.md](testing.md))                                                                    |
| `npm run test:e2e`, `test:e2e:ui`, `test:e2e:debug` | Playwright; needs the Docker services and reuses a running dev server or starts one                  |
| `npm run test:python`                               | the Solr data script's pytest suite, from the `.venv` virtual environment                            |
| `npm run solr:recreate-core`                        | a new, empty `cities` core from the repository's `solrconfig.xml` (see above)                        |
| `npm run cache:clear-city-search`                   | delete the cached city searches (`city-search:*`), not their counters                                |
| `npm run cache:clear-nearest-city`                  | delete the cached reverse geocoding results (`nearest-city:*`)                                       |

The Node version is [`.nvmrc`](../.nvmrc), the single source: local work (`nvm use`) and CI
(`node-version-file`) both read it.

## Continuous integration and deployment

Three workflows in [`.github/workflows/`](../.github/workflows), sharing the setup action
[`setup-project`](../.github/actions/setup-project/action.yml) (Node from `.nvmrc`, cached `node_modules`,
`npm ci`):

| Workflow                                          | Runs on                                                  | Does                                                                                                                                                                                                                                                                               |
| ------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Validation](../.github/workflows/validation.yml) | every push and pull request                              | type check, lint, format check, production build (with the `WORLDCLIM_API_KEY` secret)                                                                                                                                                                                             |
| [Tests](../.github/workflows/tests.yml)           | pushes and pull requests to `development` and `main`     | unit tests with coverage (reported on the pull request); then Solr and Redis services, the `cities` core and schema, the Python tests, and a cities import from freshly downloaded GeoNames. That job (named "E2E Tests") runs no Playwright tests: run `npm run test:e2e` locally |
| [Deploy](../.github/workflows/deploy.yml)         | after Tests and Validation succeed on `main`, or by hand | the deployment below                                                                                                                                                                                                                                                               |

The deploy job runs on a self-hosted runner on the production server, in its checkout of the
repository. It deploys a commit only once (it records the deployed SHA) and only after both
other workflows passed for it.

It compares the commit with the last deployed one in three groups, each with its own paths in the
workflow's `env` (with no previous deploy, or one missing from the history, every group counts as
changed):

| Group        | Files                                                                                                                         | What the deploy does                                                          |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Solr core    | `docker/solr/schema.json`, `generate_schema.py`, `solrconfig.xml`                                                             | recreates the core, reindexes, drops cached searches and nearest cities       |
| City data    | `prepare_data.py`, `src/configs/locales.json`                                                                                 | regenerates `cities.csv`, reindexes, drops cached searches and nearest cities |
| Search logic | `src/utils/solr.util.ts`, `src/constants/solr.constant.ts`, `src/libs/services/solrService.ts`, `src/app/api/cities/route.ts` | drops cached searches                                                         |

The steps, in order:

1. Reset the checkout to `origin/main` and detect the changed groups.
2. Regenerate `cities.csv` if the data changed or the file is missing.
3. Start the Docker services if they aren't running, and wait until Solr answers. A missing
   `cities` core (an earlier deploy that failed half way) is treated like a changed one.
4. If the core changed or is missing, `npm run solr:recreate-core`.
5. If the core or the data changed, or the core is empty, `npm run solr:reindex`; the deploy
   fails if the core is still empty afterwards.
6. `npm ci` and `npm run build`, last before the restart: `next build` rewrites `.next/` while
   the running `next start` still serves from it, so the site is broken from the build until
   the restart. Building after the Solr work keeps that window to the build itself instead of
   the whole recreate and reindex.
7. Restart the `climatica` systemd service and check it's active.
8. Only then drop the affected cache keys (`cache:clear-city-search`, `cache:clear-nearest-city`),
   so the old app can't cache an old result again. Popularity counters and climate data stay.

While the core is recreated and reindexed (about 2¼ minutes on the full index locally), the old
app keeps serving, but city search returns nothing or partial results; the rest of the app is
unaffected. The whole site is down only from the build to the restart. Building
`cities.csv` takes about 37 s and up to 2.1 GB of memory locally, so the server needs that much
free beside Solr (1 GB heap), Redis and the app. The job's timeout is 40 minutes.

The workflow doesn't create or change `.env`.
