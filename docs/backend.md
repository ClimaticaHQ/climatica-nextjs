# Backend

The server side is a set of Next.js route handlers in [`src/app/api/`](../src/app/api).
They keep the WorldClim API key on the server, rate-limit callers, cache in Redis, and
reach Solr, WorldClim and Wikidata. The browser only ever calls these routes (see
[architecture.md](architecture.md)).

## Route handlers

| Route                                                                           | Does                                                                                                                                                                                                                                         | Cache                                                    |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [`GET /api/cities?q=&lang=`](../src/app/api/cities/route.ts)                    | City search. Queries under 2 characters return `[]`. A query that looks like coordinates (`"40.41,-3.70"`, `"40.41, -3.70"` or `"40.41 -3.70"`) is reverse-geocoded with Wikidata; anything else is a Solr search in the requested language. | Redis (see below)                                        |
| [`GET /api/worldclim/[queryId]?…`](../src/app/api/worldclim/[queryId]/route.ts) | Proxies a WorldClim query (`cellofpoint`, `pixelvaluesofapoint`, …) to `https://scrapi.gsic.uva.es/apis/worldclim/query?id=…`, adding the bearer key.                                                                                        | None on the server; TanStack Query caches in the browser |
| [`GET /api/worldclim/resource?…`](../src/app/api/worldclim/resource/route.ts)   | Proxies a WorldClim resource lookup (e.g. a cell).                                                                                                                                                                                           | Redis, keyed by the full query string                    |
| [`GET /api/og?route=&locale=&…`](../src/app/api/og/route.tsx)                   | Renders the Open Graph image for a shared link, with the title and description from [`resolveOgMeta`](../src/utils/metadata.util.ts).                                                                                                        | —                                                        |

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

**Popular-query extension:** each cache miss that reaches the upstream increments a counter
key (`…-counter:…`) whose expiry is set on its first increment to the normal TTL. When the
count reaches the threshold (`THRESHOLDS.POPULAR_CITY`, `THRESHOLDS.POPULAR_CLIMATE`), the
result is stored with the longer TTL. Cache hits don't count (see Open issues).

Only non-empty city results and successful WorldClim answers are cached. An empty answer or
any upstream failure is retried on the next request.

## Solr city search

[`SolrService.searchCities`](../src/libs/services/solrService.ts) queries the `cities` core
(`SOLR_URL`, handler `/cities` in [`solrconfig.xml`](../docker/solr/solrconfig.xml): edismax,
10 rows, sorted by score, with a population boost).

[`buildSolrQueryParams`](../src/utils/solr.util.ts) sends its own `qf` and `pf`, built from
every locale in `locales.json`:

- `label_<lang>` and `label_<lang>_ngram` for each language.
- Weights from [`SOLR_SEARCH_WEIGHTS`](../src/constants/solr.constant.ts): the request's
  language first, English (`SOLR_SECONDARY_LANG`) second, then the rest.
- The `/cities` handler has no `qf`/`pf` defaults on purpose: the app always sends
  both, and a hand-written list would drift from `locales.json` as languages are added.
  A query sent to Solr by hand has to pass its own `qf`.

Results are de-duplicated by GeoNames id and mapped to `TCity`, with the label in the
requested language (falling back to English) and a description built from the feature and
country codes. The index is built from GeoNames (see [operations.md](operations.md) and
[i18n.md](i18n.md)).

## WorldClim proxy

The browser calls WorldClim only through `/api/worldclim/*`
([`WorldClimService`](../src/libs/services/worldClimService.ts), base
[`WORLDCLIM_PROXY_BASE`](../src/constants/api/worldclim.constants.ts)). The route handler
forwards the query string unchanged and adds `Authorization: Bearer <WORLDCLIM_API_KEY>`.
The key is a server-only env variable, never sent to the browser.

Both routes fetch through [`fetchWorldClimJson`](../src/app/api/@utils/fetchWorldClimJson.util.ts),
which returns the body only when WorldClim answered with a 2xx status and valid JSON.
Anything else is a failure the route logs and answers with `502` (see Error handling).

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

- **Shown:** the climate data on City Climate (translated `ErrorBanner`), Compare Cities,
  Compare Periods and the heat map (`ErrorBanner` with the raw axios message). The heat map's
  banner also shows a failed regional profile.
- **Not shown** (the UI stays as it was, with no data): the city search dropdown, altitude,
  cell bounds, the dataset attribution, the available climate periods, and the reverse
  lookup after a map click (the provisional label stays). A shared loading/empty/error state
  is planned with the page-structure refactor.

### Open issues

- **Reverse geocoding returns any nearby item, in English.** The nearest Wikidata item with
  coordinates can be a building, a station or a park rather than a settlement, and its
  label and description are always requested in English, whatever the page's language.
- **The popular-query TTL practically never applies.** The counter only increments on a
  cache miss, and the counter and the cached entry both live for the normal TTL, so a query
  reaches Solr or WorldClim about once per window and the count stays below the threshold.
  Counting cache hits as well (or giving the counter a longer window) would make it work.
- **Error UI is missing** in the places listed under Error handling, and the banners on
  Compare Cities, Compare Periods and the heat map show the untranslated axios message.
