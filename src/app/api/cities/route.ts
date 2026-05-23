import { WikidataService } from "@/api/services";
import { env } from "@/libs";
import { Redis } from "@upstash/redis";
import { type NextRequest, NextResponse } from "next/server";

const CACHE_TTL = 60 * 60 * 24;

function getRedis() {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return null;
  return new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.length < 2) return NextResponse.json([]);

  const redis = getRedis();
  const cacheKey = `city-search:${q.toLowerCase()}`;

  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(cached);
  }

  const results = await WikidataService.searchCity(q);

  if (redis) {
    await redis.set(cacheKey, results, { ex: CACHE_TTL });
  }

  return NextResponse.json(results);
}
