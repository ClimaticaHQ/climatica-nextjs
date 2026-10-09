# Backend

The server side is a set of Next.js route handlers in [`src/app/api/`](../src/app/api).
They keep the WorldClim API key on the server, rate-limit callers, cache in Redis, and
reach Solr, WorldClim and Wikidata. The browser only ever calls these routes (see
[architecture.md](architecture.md)).

## Route handlers

| Route                                                                           | Does                                                                                                                                                                                                     | Cache                                                    |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [`GET /api/cities?q=&lang=`](../src/app/api/cities/route.ts)                    | City search. Queries under 2 characters return `[]`. A query that looks like coordinates (`"40.41, -3.70"`) is reverse-geocoded with Wikidata; anything else is a Solr search in the requested language. | Redis (see below)                                        |
| [`GET /api/worldclim/[queryId]?…`](../src/app/api/worldclim/[queryId]/route.ts) | Proxies a WorldClim query (`cellofpoint`, `pixelvaluesofapoint`, …) to `https://scrapi.gsic.uva.es/apis/worldclim/query?id=…`, adding the bearer key.                                                    | None on the server; TanStack Query caches in the browser |
| [`GET /api/worldclim/resource?…`](../src/app/api/worldclim/resource/route.ts)   | Proxies a WorldClim resource lookup (e.g. a cell).                                                                                                                                                       | Redis, keyed by the full query string                    |
| [`GET /api/og?route=&locale=&…`](../src/app/api/og/route.tsx)                   | Renders the Open Graph image for a shared link, with the title and description from [`resolveOgMeta`](../src/utils/metadata.util.ts).                                                                    | —                                                        |

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

**Popular-query extension:** each lookup increments a counter key (`…-counter:…`) whose
expiry is set on its first increment to the normal TTL. When the count reaches the
threshold (`THRESHOLDS.POPULAR_CITY`, `THRESHOLDS.POPULAR_CLIMATE`), the result is stored
with the longer TTL.

Only non-empty city results are cached, so an empty answer (or a failed Solr call) is
retried next time.

## Solr city search

[`SolrService.searchCities`](../src/libs/services/solrService.ts) queries the `cities` core
(`SOLR_URL`, handler `/cities` in [`solrconfig.xml`](../docker/solr/solrconfig.xml): edismax,
10 rows, sorted by score, with a population boost).

[`buildSolrQueryParams`](../src/utils/solr.util.ts) sends its own `qf` and `pf`, built from
every locale in `locales.json`:

- `label_<lang>` and `label_<lang>_ngram` for each language.
- Weights from [`SOLR_SEARCH_WEIGHTS`](../src/constants/solr.constant.ts): the request's
  language first, English (`SOLR_SECONDARY_LANG`) second, then the rest.
- Those params override the handler's defaults.

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

## Wikidata reverse geocoding

For a coordinate query, [`WikidataService.findNearestCityByCoordinates`](../src/libs/services/wikidataService.ts)
asks Wikidata's geosearch for up to 5 items within 10 km (nearest first), fetches their
labels and descriptions, and returns the first one as a `TCity`. That's the nearest
Wikidata item with coordinates, not necessarily a settlement. Labels are requested in
English.

## Error handling

- **Solr:** a failed request or a Solr error status is logged and returns `[]`.
- **Redis:** errors are logged; reads become misses, writes are skipped, rate limiting is
  skipped.
- **WorldClim and Wikidata:** not caught in the route handlers; a network failure or a
  non-JSON body becomes a 500.

### Open issues

- **`200 []` on Solr errors.** `/api/cities` answers a Solr failure with `200` and an
  empty list, so the client can't tell "no city found" from "search is down". It should
  return an error status the search UI can show.
- **The WorldClim proxy passes errors on as success.** `/api/worldclim/[queryId]` and
  `/resource` return the upstream JSON with status 200 whatever WorldClim answered.
  `/resource` also caches it, so an upstream error body can be served from Redis for up
  to 7 days.
- **Coordinates separated by a space** (`"40.41 -3.70"`) pass `COORDINATE_REGEX`, but
  [`parseCoordinates`](../src/app/api/@utils/parseCoordinates.util.ts) splits on commas
  only. Such a query falls through to a Solr text search instead of reverse geocoding.
- **Unused code:** `WikidataService.searchCity` (with its in-memory cache), the
  `climateData` strategy's key builders and `CACHE_TTL.WORLDCLIM_RESOURCE` are never
  called.
