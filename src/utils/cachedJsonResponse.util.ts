import { CACHE_STATUS_HEADER, SERVER_TIMING_DECIMALS, SERVER_TIMING_HEADER } from "@/constants";
import type { TCacheInfo, TTimedUpstream, TUpstreamSource } from "@/types";
import { NextResponse } from "next/server";

/**
 * A successful data response with its cache status in X-Cache and, when the route called
 * upstream, that call's duration in Server-Timing — so server time and network time can be told
 * apart. Error and rate-limit responses don't use it.
 */
export function cachedJsonResponse(data: unknown, { status, upstream }: TCacheInfo): NextResponse {
  const headers = new Headers({ [CACHE_STATUS_HEADER]: status });
  if (upstream) {
    const duration = upstream.durationMs.toFixed(SERVER_TIMING_DECIMALS);
    headers.set(SERVER_TIMING_HEADER, `${upstream.source};dur=${duration}`);
  }
  return NextResponse.json(data, { headers });
}

/** Times an upstream call; a rejection passes through untimed */
export async function timeUpstream<T>(
  source: TUpstreamSource,
  call: () => Promise<T>,
): Promise<TTimedUpstream<T>> {
  const start = performance.now();
  const result = await call();
  return { result, timing: { source, durationMs: performance.now() - start } };
}
