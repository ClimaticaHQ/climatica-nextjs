import { API_ERRORS, TIME, WORLDCLIM_UPSTREAM_BASE } from "@/constants";
import { logger } from "@/libs/Logger";
import { checkRateLimit, REDIS_STRATEGIES } from "@/libs/redis";
import { RedisClient } from "@/libs/redis/client";
import { apiErrorResponse, getClientIp, rateLimitResponse } from "@/utils";
import { type NextRequest, NextResponse } from "next/server";
import { fetchWorldClimJson } from "../../@utils";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(ip, "worldclim-resource", 1000, TIME.IN_SECONDS.MINUTE);
  if (!rl.allowed) return rateLimitResponse(rl);
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${WORLDCLIM_UPSTREAM_BASE}/resource?${searchParams}`;

  const strategy = REDIS_STRATEGIES.worldclimResource;
  const cacheKey = strategy.buildKey(searchParams);

  const cached = await RedisClient.get<unknown>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const result = await fetchWorldClimJson(url);
  // * a failure is answered but never cached, so the next request tries upstream again
  if (!result.ok) {
    logger.error(`[WorldClim] resource ${searchParams} failed: ${result.reason}`);
    return apiErrorResponse(API_ERRORS.WORLDCLIM_UNAVAILABLE);
  }

  const count = await RedisClient.incrementCounter(
    strategy.buildCounterKey(searchParams),
    strategy.ttl,
  );
  const ttl = count >= strategy.popularThreshold ? strategy.popularTtl : strategy.ttl;
  await RedisClient.set(cacheKey, result.data, ttl);

  return NextResponse.json(result.data);
}
