# API benchmark

Measures the API route handlers cold (Redis miss, upstream call) against warm (Redis hit). Every
data response carries `X-Cache: HIT | MISS | BYPASS` and, when the route called upstream,
`Server-Timing: <solr|wikidata|worldclim>;dur=<ms>` — so the upstream share of a cold request can
be told apart from the server and network time around it (see docs/backend.md).

## Run against a production build

```sh
npm run docker:up            # Solr and Redis
npm run build && npm run start
# in another terminal
npm run bench -- --flush --runs 5
# or, with the dev server on 3000: npx next start -p 3001, then --base http://localhost:3001
```

Measure `next start`, not `next dev`: the dev server compiles routes on first hit and adds its own
overhead.

## URL lists

`urls/*.txt`: one URL per line, either a path (`/api/cities?q=rome&lang=en`) or a full URL whose
protocol and host `--base` replaces. Empty lines and lines starting with `#` are ignored.

| File                      | Route                                | Upstream call                |
| ------------------------- | ------------------------------------ | ---------------------------- |
| `climate.txt`             | `/api/worldclim/pixelvaluesofapoint` | SCRAPI `pixelvaluesofapoint` |
| `cells.txt`               | `/api/worldclim/cellofpoint`         | SCRAPI `cellofpoint`         |
| `coords.txt`              | `/api/cities?q=lat,lng`              | Solr nearest city            |
| `search.txt`, `typos.txt` | `/api/cities?q=…`                    | Solr city search             |

Every list keyed by place uses the same 50 cities, from `places.json` (name, country, continent,
coordinates and GeoNames id from our Solr index, the `q` the name search sends, and whether it is
one of the original 25). Six original name queries are not English on purpose (multilingual
search); the added cities use their English label.

Each proxy request makes exactly one upstream call, so the route path names the call
`Server-Timing` timed (the header itself only says `worldclim`). `cells.txt` holds the places of
`climate.txt`.

A URL with a `grid` param is run once per resolution (`--grids`), only the grid changed. A climate
point query has no period param: SCRAPI answers every climate period at once (only 1970–2000 at
30″), so responses differ in size across resolutions — the payload table reports it.

## Options

| Flag      | Default                 | Does                                                          |
| --------- | ----------------------- | ------------------------------------------------------------- |
| `--file`  | every `urls/*.txt`      | one list, by name (`search` or `search.txt`)                  |
| `--base`  | `http://localhost:3000` | the host the listed URLs are sent to                          |
| `--runs`  | `1`                     | repeats the whole list; above 1 it needs `--flush`            |
| `--delay` | `200`                   | ms between requests                                           |
| `--flush` | off                     | `FLUSHALL` on the `climatica-redis` container before each run |
| `--grids` | `10m,5m,2.5m,30s`       | the resolutions a URL with a `grid` param is run at           |

`--flush` is refused unless `--base` is `localhost` or `127.0.0.1`. It wipes the whole local Redis,
rate-limit and popularity counters included.

## What it does

1. One unmeasured warm-up request per route path, without its query string: it loads the route
   and opens the connection, but fills no key a measured URL uses.
2. Per run (after the flush): for each URL, a cold request, then a warm one, `--delay` apart. The
   time is from sending the request to having read the whole body.
3. Writes to `results/` (gitignored), named `benchmark-<timestamp>`:
   - `.csv`: one row per request — run, file, endpoint, grid, URL, phase, status, ms, `X-Cache`,
     `Server-Timing`, its upstream ms, bytes, bindings, periods, predicted BYPASS, valid, reason
   - `.json`: the options, every pair with both measurements, and the summaries
   - `.tex`: two booktabs tables, one row per endpoint and resolution — timings (n, excluded pairs
     by reason, median and p95 uncached and cached, speed-up, upstream share) and payload (size,
     bindings, periods)
   - `.places.tex`: the footnote — every city with its country, grouped by continent — and the
     sample in numbers (per continent, per hemisphere, latitude range)
   - the JSON also holds the same summaries over the original 25 cities, for comparison with
     25-city runs, and the coverage report below
4. Prints per endpoint and resolution: valid pairs, exclusions, median and p95 uncached and cached,
   the speed-up (median uncached / median cached), the median upstream ms and its median share of
   the uncached time, and the median response size, bindings and periods.

A pair is valid when cold was a `200` `MISS` and warm a `200` `HIT`. The rest are excluded by
reason, the first that applies:

- **error**: a failed request or a non-2xx status
- **near edge**: cold `BYPASS` — the point lies within 5·10⁻⁴° of a cell edge (a finer grid has
  more edges). The app's own rule (`buildPointCacheParts`) predicts these before the run; a
  mismatch is reported.
- **no data**: an empty answer — a cell without WorldClim data (coast, island); the app never
  caches it
- **other**: any other cache state

The coverage report lists every city whose SCRAPI answer at an endpoint and resolution was empty,
failed, or held fewer bindings than the full answers there (city, resolution, status, bindings per
run, missing variables and periods). An incomplete but non-empty answer stays in the timings. Others stay in the CSV with
the reason and are left out of the summary — e.g. an empty search result (never cached, so warm is
`MISS` too), a point query (`BYPASS`, not cached in Redis), a key already cached without
`--flush`, or an upstream error.
