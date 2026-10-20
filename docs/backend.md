# Backend

The server side is a set of Next.js route handlers in [`src/app/api/`](../src/app/api).
They keep the WorldClim API key on the server, rate-limit callers, cache in Redis, and
reach Solr, WorldClim and Wikidata. The browser only ever calls these routes (see
[architecture.md](architecture.md)).

## Route handlers

| Route                                                                           | Does                                                                                                                                                                                                                                         | Cache                                                                                       |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [`GET /api/cities?q=&lang=`](../src/app/api/cities/route.ts)                    | City search. Queries under 2 characters return `[]`. A query that looks like coordinates (`"40.41,-3.70"`, `"40.41, -3.70"` or `"40.41 -3.70"`) is reverse-geocoded with Wikidata; anything else is a Solr search in the requested language. | Redis (see below)                                                                           |
| [`GET /api/worldclim/[queryId]?…`](../src/app/api/worldclim/[queryId]/route.ts) | Proxies a WorldClim query (`cellofpoint`, `pixelvaluesofapoint`, …) to `https://scrapi.gsic.uva.es/apis/worldclim/query?id=…`, adding the bearer key.                                                                                        | Region queries in Redis, one entry per strip; the rest only in the browser (TanStack Query) |
| [`GET /api/worldclim/resource?…`](../src/app/api/worldclim/resource/route.ts)   | Proxies a WorldClim resource lookup (e.g. a cell).                                                                                                                                                                                           | Redis, keyed by the full query string                                                       |
| [`GET /api/og?route=&locale=&…`](../src/app/api/og/route.tsx)                   | Renders the Open Graph image for a shared link, with the title and description from [`resolveOgMeta`](../src/utils/metadata.util.ts).                                                                                                        | —                                                                                           |

## Rate limiting

Each API route (all but `/api/og`) starts with
[`checkRateLimit`](../src/libs/redis/rateLimit.ts): 1000 requests per minute per IP and
endpoint. The IP comes from `x-forwarded-for` or `x-real-ip`
([`getClientIp`](../src/utils/getClientIp.util.ts)). Over the limit, the route returns
`429` with `X-RateLimit-*` and `Retry-After` headers
([`rateLimitResponse`](../src/utils/rateLimitResponse.util.ts)). If Redis is down, the
limiter lets requests through rather than blocking the app.

## Redis caching

[`RedisClient`](../src/libs/redis/client.ts) is a singleton ioredis connection
(`REDIS_URL`): it connects lazily, retries with exponential backoff capped at 2 s, and gives
up after 10 attempts. Its `get` and `set` never throw: a Redis error is logged and treated as
a cache miss, so the app keeps working without the cache.

Strategies are in [`strategies.ts`](../src/libs/redis/strategies.ts), and the keys and TTLs
in [`redis.constant.ts`](../src/constants/redis.constant.ts):

| What                                  | Key                                     | TTL                                                            |
| ------------------------------------- | --------------------------------------- | -------------------------------------------------------------- |
| City search, query under 4 characters | `city-search:<lang>:<query>`            | 1 day                                                          |
| City search, longer query             | same                                    | 7 days; **30 days once the query has been looked up 10 times** |
| Nearest city (coordinates)            | `nearest-city:<lat>:<lng>` (4 decimals) | 7 days                                                         |
| WorldClim resource                    | `worldclim-resource:<query string>`     | 7 days; **30 days once looked up 5 times**                     |
| WorldClim region query (one strip)    | `worldclim-query:<id>:<query string>`   | 7 days; **30 days once looked up 5 times**                     |

**Popular-query extension:** each cache miss that reaches the upstream increments a counter
key (`…-counter:…`) whose expiry is set on its first increment to the normal TTL. When the
count reaches the threshold (`THRESHOLDS.POPULAR_CITY`, `THRESHOLDS.POPULAR_CLIMATE`), the
result is stored with the longer TTL. Cache hits don't count.

Only non-empty city results and successful WorldClim answers are cached. An empty answer or
any upstream failure is retried on the next request.

## Solr city search

How the index, the query and the ranking work is in [city-search.md](city-search.md).

## WorldClim proxy

The browser calls WorldClim only through `/api/worldclim/*`
([`WorldClimService`](../src/libs/services/worldClimService.ts), base
[`WORLDCLIM_PROXY_BASE`](../src/constants/api/worldclim.constants.ts)). The route handler
forwards the query string unchanged and adds `Authorization: Bearer <WORLDCLIM_API_KEY>`.
The key is a server-only env variable, never sent to the browser.

Both routes fetch through [`fetchWorldClimJson`](../src/app/api/@utils/fetchWorldClimJson.util.ts),
which returns the body only when WorldClim answered with a 2xx status and valid JSON.
Anything else is a failure the route logs and answers with `502` (see Error handling).

### Row limits

WorldClim's query templates come in two kinds. Point queries (`cellofpoint`,
`pixelvaluesofapoint`) have no `LIMIT` and return every row. Region queries
(`pixelvaluesinbox`, `pixelvaluesinpolygonGEO` and their `avg…` versions) stop at 100 rows
unless given a `limit`, and at **10,000 rows whatever the `limit`**
([`WORLDCLIM_MAX_ROWS`](../src/constants/worldclim.constant.ts)). `offset` can't page past
that: the queries have no `ORDER BY`, so pages repeat and skip rows.

| Request                                        | Rows at most                                        | `limit` sent  |
| ---------------------------------------------- | --------------------------------------------------- | ------------- |
| `cellofpoint` (altitude, cell bounds)          | 4 (one cell per grid)                               | none (no cap) |
| `pixelvaluesofapoint`, Climate, 3 variables    | 180 (3 × 12 months × 5 periods)                     | none (no cap) |
| `pixelvaluesofapoint`, Climate, raw export (6) | 216 (3 × 12 × 5, plus 3 × 12 for `c1970-2000` only) | none (no cap) |
| `pixelvaluesofapoint`, Weather, 3 variables    | 36                                                  | none (no cap) |
| `resource` (cell, raster, pixel)               | one resource, not rows                              | —             |
| `pixelvaluesinbox`, one heat map strip         | cells × 12 × variables, ≤ 10,000                    | exactly that  |
| `avgpixelvaluesinbox` / `…inpolygonGEO`        | 12 × variables (36 for the regional profile)        | exactly that  |

A region query names the selected period's rasters (`raster`) for Climate: without it every
normals period comes back, five times the rows. The heat map's cells
([`getRegionPixelValues`](../src/libs/services/worldClimService.ts)) are fetched as latitude
strips that each fit in 10,000 rows ([`splitRegionIntoStrips`](../src/utils/regionQuery.util.ts)),
in parallel, and merged. Inner strip edges are grid lines, half a cell from any centroid, so
every cell is in exactly one strip and the same region always asks for the same strips. A
region too wide for one row of cells per strip is also split by longitude. A polygon is
read from the strips of the box around it, keeping the cells whose centroid lies inside, the
same cells as WorldClim's polygon query (which can't be split). The regional profile asks
for its three variables' averages in one request.

The heat map loads at most `FILTER_MAX_HEATMAP_CELLS` (2,000) cells, counted on what is
fetched: a box, or the box around a polygon. Past that, the region isn't loaded and the page
names the finest resolution it fits at; for a polygon it tells the polygon's own cells
([`countCellsInPolygon`](../src/utils/cellCount.util.ts)) from its box's, so a thin diagonal
polygon within the cap says why it still can't load. A region within the cap
takes at most 4 strip requests plus 1 for the profile, well within the proxy's rate limit of
1,000 requests a minute per IP. Each strip is cached in Redis under its own query string.
The page side — drawing, colour scales, statistics — is in [heat-map.md](heat-map.md).

## Wikidata reverse geocoding

For a coordinate query, [`WikidataService.findNearestCityByCoordinates`](../src/libs/services/wikidataService.ts)
asks Wikidata's geosearch for up to 5 items within 10 km (nearest first), fetches their
labels and descriptions, and returns the first one as a `TCity`. That's the nearest
Wikidata item with coordinates, not necessarily a settlement. Labels are requested in
English.

## Error handling

An upstream failure is answered with an error status and a `{ "error": "<message>" }` body
([`apiErrorResponse`](../src/utils/apiErrorResponse.util.ts), statuses and messages in
[`API_ERRORS`](../src/constants/api/api.constant.ts)). It is never answered as data and
never cached.

| Failure                                                                                          | Route                       | Answer                                                            |
| ------------------------------------------------------------------------------------------------ | --------------------------- | ----------------------------------------------------------------- |
| Solr unreachable, non-2xx, or a non-zero `responseHeader.status` (`SolrService` logs and throws) | `/api/cities` (text)        | `503`                                                             |
| Wikidata request fails                                                                           | `/api/cities` (coordinates) | `502`                                                             |
| WorldClim non-2xx, network failure, or a body that isn't JSON                                    | `/api/worldclim/*`          | `502`                                                             |
| Redis errors                                                                                     | all                         | logged; reads become misses, writes and rate limiting are skipped |

In the browser, `apiClient` (axios) rejects on any non-2xx status, so these reach the hooks as
TanStack Query errors (`isError` / `error`), not as data. Whether a page shows them depends
on the page:

- **Shown:** every page's data, as the page's error message in `PageLayout`: the translated
  message for its cause ([`getErrorMessageKey`](../src/utils/apiError.util.ts)), never the
  error's own text. The heat map's message also covers a failed regional profile. A failed
  city search says so in the search's dropdown, a failed place lookup after a map click in a
  notice under the search.
- **Not shown** (the UI stays as it was, with no data): altitude, cell bounds, the dataset
  attribution and the available climate periods.
