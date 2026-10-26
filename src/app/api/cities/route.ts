import { API_ERRORS, CACHE_TTL, TIME } from "@/constants";
import { logger } from "@/libs/Logger";
import { checkRateLimit, REDIS_STRATEGIES } from "@/libs/redis";
import { RedisClient } from "@/libs/redis/client";
import { SolrService, WikidataService } from "@/libs/services";
import type { TCity, TCoordinates } from "@/types";
import { apiErrorResponse, getClientIp, rateLimitResponse } from "@/utils";
import { type NextRequest, NextResponse } from "next/server";
import { parseCoordinates } from "../@utils";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip, "cities", 1000, TIME.IN_SECONDS.MINUTE);
  if (!rl.allowed) return rateLimitResponse(rl);
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const lang = request.nextUrl.searchParams.get("lang") ?? "en";

  logger.info(`[Cities] GET called: q="${q}", lang="${lang}"`);

  if (!q || q.length < 2) return NextResponse.json([]);

  const coords = parseCoordinates(q);
  return coords ? searchByCoordinates(coords) : searchByText(q, lang);
}

async function searchByCoordinates(coords: TCoordinates) {
  const cacheKey = REDIS_STRATEGIES.nearestCity.buildKey(coords);
  const cached = await RedisClient.get(cacheKey);
  if (cached) {
    logger.info(`[Cities] Cache HIT for key: ${cacheKey}`);
    return NextResponse.json(cached);
  }
  logger.info(`[Cities] Cache MISS for key: ${cacheKey}`);

  let city: TCity | null;
  try {
    city = await WikidataService.findNearestCityByCoordinates(coords.lat, coords.lng);
  } catch (error) {
    logger.error(`[Cities] Reverse geocoding failed: ${String(error)}`);
    return apiErrorResponse(API_ERRORS.REVERSE_GEOCODING_UNAVAILABLE);
  }

  const result = city ? [city] : [];
  if (result.length > 0) {
    await RedisClient.set(cacheKey, result, REDIS_STRATEGIES.nearestCity.ttl);
  }
  return NextResponse.json(result);
}

async function searchByText(q: string, lang: string) {
  const strategy = REDIS_STRATEGIES.citySearch;
  const cacheKey = strategy.buildKey({ query: q, lang });

  const cached = await RedisClient.get(cacheKey);
  if (cached) {
    logger.info(`[Cities] Cache HIT for key: ${cacheKey}`);
    return NextResponse.json(cached);
  }
  logger.info(`[Cities] Cache MISS for key: ${cacheKey}`);

  let results: TCity[];
  try {
    results = await SolrService.searchCities(q, lang);
  } catch {
    // * SolrService has logged the cause; an outage is an error, not an empty list
    return apiErrorResponse(API_ERRORS.CITY_SEARCH_UNAVAILABLE);
  }
  logger.info(`[Cities] Solr returned ${results.length} results`);

  if (results.length > 0) {
    const isShortQuery = q.length < 4;

    if (isShortQuery) {
      await RedisClient.set(cacheKey, results, strategy.shortTtl);
      logger.info(
        `[Cities] Cached ${results.length} results with short TTL ${CACHE_TTL.CITY_SEARCH_SHORT}s`,
      );
    } else {
      const counterKey = strategy.buildCounterKey({ query: q, lang });
      const count = await RedisClient.incrementCounter(counterKey, strategy.ttl);
      const ttl = count >= strategy.popularThreshold ? strategy.popularTtl : strategy.ttl;
      await RedisClient.set(cacheKey, results, ttl);
      logger.info(`[Cities] Cached ${results.length} results with TTL ${ttl}s`);
    }
  }

  return NextResponse.json(results);
}
