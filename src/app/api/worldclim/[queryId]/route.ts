import {
  API_ERRORS,
  CACHE_STATUS,
  TIME,
  UPSTREAM_SOURCES,
  WORLDCLIM_CACHED_QUERY_IDS,
  WORLDCLIM_UPSTREAM_BASE,
} from "@/constants";
import { logger } from "@/libs/Logger";
import { checkRateLimit, PopularityCache, REDIS_STRATEGIES } from "@/libs/redis";
import { RedisClient } from "@/libs/redis/client";
import type { TWorldClimCacheEntry } from "@/types";
import {
  apiErrorResponse,
  buildPointCacheParts,
  cachedJsonResponse,
  getClientIp,
  isAnswerForCells,
  rateLimitResponse,
  timeUpstream,
} from "@/utils";
import type { NextRequest } from "next/server";
import { fetchWorldClimJson } from "../../@utils";

/**
 * Point queries are cached by the cell holding the point; region queries one strip at a time,
 * each strip under its own query string. Anything else isn't cached.
 */
function resolveCacheEntry(queryId: string, params: URLSearchParams): TWorldClimCacheEntry | null {
  const point = buildPointCacheParts(queryId, params);
  if (point) {
    return {
      ...REDIS_STRATEGIES.worldclimPoint.buildEntry(point),
      // * stored only when SCRAPI answered for the cell the key names
      canStore: (data) => isAnswerForCells(data, point.expectedCells),
    };
  }

  if (!WORLDCLIM_CACHED_QUERY_IDS.includes(queryId)) return null;
  return {
    ...REDIS_STRATEGIES.worldclimQuery.buildEntry(queryId, params.toString()),
    canStore: () => true,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ queryId: string }> },
) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip, "worldclim", 1000, TIME.IN_SECONDS.MINUTE);
  if (!rl.allowed) return rateLimitResponse(rl);
  const { queryId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const url = `${WORLDCLIM_UPSTREAM_BASE}/query?id=${queryId}&${searchParams.toString()}`;

  const entry = resolveCacheEntry(queryId, searchParams);
  if (entry) {
    const cached = await RedisClient.get<unknown>(entry.key);
    if (cached) {
      await PopularityCache.recordHit(entry);
      return cachedJsonResponse(cached, { status: CACHE_STATUS.HIT });
    }
  }

  const { result, timing } = await timeUpstream(UPSTREAM_SOURCES.WORLDCLIM, () =>
    fetchWorldClimJson(url),
  );
  // * a failure is answered but never cached, so the next request tries upstream again
  if (!result.ok) {
    logger.error(`[WorldClim] query ${queryId} failed: ${result.reason}`);
    return apiErrorResponse(API_ERRORS.WORLDCLIM_UNAVAILABLE);
  }

  if (entry?.canStore(result.data)) await PopularityCache.store(entry, result.data);

  const status = entry ? CACHE_STATUS.MISS : CACHE_STATUS.BYPASS;
  return cachedJsonResponse(result.data, { status, upstream: timing });
}
