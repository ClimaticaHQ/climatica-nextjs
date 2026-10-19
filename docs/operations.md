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
   `label_<lang>` column per locale.
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
  to the `cities` core.

`schema.json` is generated from `locales.json` by
[`generate_schema.py`](../docker/solr/scripts/generate_schema.py) and committed; only
whoever changes the locale list runs the generator (see [localization-i18n.md](localization-i18n.md)).

## Updating an existing environment

After pulling changes:

| What changed                                                                | Run                                                                                             |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `docker/solr/solrconfig.xml`, or the `cities` core fails to load            | `npm run docker:reboot` (recreates the core; wipes the index and Redis), then the reindex below |
| `src/configs/locales.json` or `prepare_data.py` (`cities.csv` isn't in git) | `python3 docker/solr/scripts/prepare_data.py`                                                   |
| `docker/solr/schema.json`, or after either of the above                     | `npm run solr:reindex`                                                                          |
| `.example.env` (a new variable)                                             | add it to `.env`                                                                                |

Solr copies `solrconfig.xml` into the core only when the core is created, which is why a
config change needs the reboot.

Cached responses survive in Redis across deploys (city searches up to 30 days, see
[backend.md](backend.md)). After a change that alters what an API returns, clear them with
`docker exec climatica-redis redis-cli FLUSHDB` (it also resets the rate-limit counters),
or reboot the services.

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
other workflows passed for it. Then, in order:

1. Reset the checkout to `origin/main`.
2. If `prepare_data.py` or `locales.json` changed since the last deploy, regenerate
   `cities.csv`.
3. Start the Docker services if they aren't running and wait for Solr's healthcheck.
4. If `solrconfig.xml` changed, reload the `cities` core (a core reads it only when it loads;
   the server reloads the core instead of recreating it, so the index is kept).
5. Reindex Solr when the core is empty or the data inputs changed, and fail if it's still
   empty.
6. Flush Redis when the data or the Solr config changed, so cached city searches don't
   outlive the fix.
7. `npm ci`, `npm run build`, restart the `climatica` systemd service and check it's active.

The workflow doesn't create or change `.env`.
