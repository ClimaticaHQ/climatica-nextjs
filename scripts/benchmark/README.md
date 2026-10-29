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
```

Measure `next start`, not `next dev`: the dev server compiles routes on first hit and adds its own
overhead.

## URL lists

`urls/search.txt`, `urls/typos.txt`, `urls/climate.txt`: one URL per line, either a path
(`/api/cities?q=rome&lang=en`) or a full URL whose protocol and host `--base` replaces. Empty lines
and lines starting with `#` are ignored.

## Options

| Flag      | Default                 | Does                                                          |
| --------- | ----------------------- | ------------------------------------------------------------- |
| `--file`  | every `urls/*.txt`      | one list, by name (`search` or `search.txt`)                  |
| `--base`  | `http://localhost:3000` | the host the listed URLs are sent to                          |
| `--runs`  | `1`                     | repeats the whole list; above 1 it needs `--flush`            |
| `--delay` | `200`                   | ms between requests                                           |
| `--flush` | off                     | `FLUSHALL` on the `climatica-redis` container before each run |

`--flush` is refused unless `--base` is `localhost` or `127.0.0.1`. It wipes the whole local Redis,
rate-limit and popularity counters included.

## What it does

1. One unmeasured warm-up request per route path, without its query string: it loads the route
   and opens the connection, but fills no key a measured URL uses.
2. Per run (after the flush): for each URL, a cold request, then a warm one, `--delay` apart. The
   time is from sending the request to having read the whole body.
3. Writes `results/benchmark-<timestamp>.csv` (gitignored), one row per request: run, file, URL,
   phase, status, ms, `X-Cache`, `Server-Timing`, the upstream ms read from it, valid, reason.
4. Prints per file: valid pairs, median and p95 of cold and warm, and the speed-up (median cold /
   median warm).

A pair is valid when cold was a `200` `MISS` and warm a `200` `HIT`. Others stay in the CSV with
the reason and are left out of the summary — e.g. an empty search result (never cached, so warm is
`MISS` too), a point query (`BYPASS`, not cached in Redis), a key already cached without
`--flush`, or an upstream error.
