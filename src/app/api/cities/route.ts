import {
  API_ERRORS,
  CACHE_STATUS,
  CACHE_TTL,
  DEFAULT_LOCALE,
  LOCALES,
  TIME,
  UPSTREAM_SOURCES,
} from "@/constants";
import { logger } from "@/libs/Logger";
import { checkRateLimit, PopularityCache, REDIS_STRATEGIES } from "@/libs/redis";
import { RedisClient } from "@/libs/redis/client";
import { SolrService } from "@/libs/services";
import type { TCity, TNearestCityParams, TTimedUpstream } from "@/types";
import {
  apiErrorResponse,
  cachedJsonResponse,
  getClientIp,
  rateLimitResponse,
  timeUpstream,
} from "@/utils";
import type { NextRequest } from "next/server";
import { parseCoordinates } from "../@utils";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip, "cities", 1000, TIME.IN_SECONDS.MINUTE);
  if (!rl.allowed) return rateLimitResponse(rl);
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const lang = request.nextUrl.searchParams.get("lang") ?? "en";

  logger.info(`[Cities] GET called: q="${q}", lang="${lang}"`);

  if (!q || q.length < 2) return cachedJsonResponse([], { status: CACHE_STATUS.BYPASS });

  const coords = parseCoordinates(q);
  // * only a supported language: any other would split the cache without changing the answer
  const placeLang = LOCALES.includes(lang) ? lang : DEFAULT_LOCALE;
  return coords ? searchByCoordinates({ ...coords, lang: placeLang }) : searchByText(q, lang);
}

async function searchByCoordinates(params: TNearestCityParams) {
  const cacheKey = REDIS_STRATEGIES.nearestCity.buildKey(params);
  const cached = await RedisClient.get(cacheKey);
  if (cached) {
    logger.info(`[Cities] Cache HIT for key: ${cacheKey}`);
    return cachedJsonResponse(cached, { status: CACHE_STATUS.HIT });
  }
  logger.info(`[Cities] Cache MISS for key: ${cacheKey}`);

  let lookup: TTimedUpstream<TCity | null>;
  try {
    lookup = await timeUpstream(UPSTREAM_SOURCES.SOLR, () => SolrService.findNearestCity(params));
  } catch (error) {
    logger.error(`[Cities] Reverse geocoding failed: ${String(error)}`);
    return apiErrorResponse(API_ERRORS.REVERSE_GEOCODING_UNAVAILABLE);
  }

  const result = lookup.result ? [lookup.result] : [];
  if (result.length > 0) {
    await RedisClient.set(cacheKey, result, REDIS_STRATEGIES.nearestCity.ttl);
  }
  return cachedJsonResponse(result, { status: CACHE_STATUS.MISS, upstream: lookup.timing });
}

async function searchByText(q: string, lang: string) {
  const strategy = REDIS_STRATEGIES.citySearch;
  const entry = strategy.buildEntry({ query: q, lang });
  const cacheKey = entry.key;
  // * a short query is stored briefly and never counts as popular
  const isShortQuery = q.length < 4;

  const cached = await RedisClient.get(cacheKey);
  if (cached) {
    logger.info(`[Cities] Cache HIT for key: ${cacheKey}`);
    if (!isShortQuery) await PopularityCache.recordHit(entry);
    return cachedJsonResponse(cached, { status: CACHE_STATUS.HIT });
  }
  logger.info(`[Cities] Cache MISS for key: ${cacheKey}`);

  let search: TTimedUpstream<TCity[]>;
  try {
    search = await timeUpstream(UPSTREAM_SOURCES.SOLR, () => SolrService.searchCities(q, lang));
  } catch {
    // * SolrService has logged the cause; an outage is an error, not an empty list
    return apiErrorResponse(API_ERRORS.CITY_SEARCH_UNAVAILABLE);
  }
  const results = search.result;
  logger.info(`[Cities] Solr returned ${results.length} results`);

  if (results.length > 0) {
    if (isShortQuery) {
      await RedisClient.set(cacheKey, results, strategy.shortTtl);
      logger.info(
        `[Cities] Cached ${results.length} results with short TTL ${CACHE_TTL.CITY_SEARCH_SHORT}s`,
      );
    } else {
      await PopularityCache.store(entry, results);
      logger.info(`[Cities] Cached ${results.length} results`);
    }
  }

  return cachedJsonResponse(results, { status: CACHE_STATUS.MISS, upstream: search.timing });
}
