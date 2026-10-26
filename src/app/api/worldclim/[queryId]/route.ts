import { API_ERRORS, TIME, WORLDCLIM_CACHED_QUERY_IDS, WORLDCLIM_UPSTREAM_BASE } from "@/constants";
import { logger } from "@/libs/Logger";
import { checkRateLimit, REDIS_STRATEGIES } from "@/libs/redis";
import { RedisClient } from "@/libs/redis/client";
import { apiErrorResponse, getClientIp, rateLimitResponse } from "@/utils";
import { type NextRequest, NextResponse } from "next/server";
import { fetchWorldClimJson } from "../../@utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ queryId: string }> },
) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip, "worldclim", 1000, TIME.IN_SECONDS.MINUTE);
  if (!rl.allowed) return rateLimitResponse(rl);
  const { queryId } = await params;
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${WORLDCLIM_UPSTREAM_BASE}/query?id=${queryId}&${searchParams}`;

  // * region queries are cached one strip at a time: each strip is its own query string
  const isCached = WORLDCLIM_CACHED_QUERY_IDS.includes(queryId);
  const strategy = REDIS_STRATEGIES.worldclimQuery;
  const cacheKey = strategy.buildKey(queryId, searchParams);
  if (isCached) {
    const cached = await RedisClient.get<unknown>(cacheKey);
    if (cached) return NextResponse.json(cached);
  }

  const result = await fetchWorldClimJson(url);
  // * a failure is answered but never cached, so the next request tries upstream again
  if (!result.ok) {
    logger.error(`[WorldClim] query ${queryId} failed: ${result.reason}`);
    return apiErrorResponse(API_ERRORS.WORLDCLIM_UNAVAILABLE);
  }

  if (isCached) {
    const count = await RedisClient.incrementCounter(
      strategy.buildCounterKey(queryId, searchParams),
      strategy.ttl,
    );
    const ttl = count >= strategy.popularThreshold ? strategy.popularTtl : strategy.ttl;
    await RedisClient.set(cacheKey, result.data, ttl);
  }

  return NextResponse.json(result.data);
}
