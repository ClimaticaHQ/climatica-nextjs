import { CACHE_STATUS_HEADER, SERVER_TIMING_DECIMALS, SERVER_TIMING_HEADER } from "@/constants";
import type { TCacheInfo, TTimedUpstream, TUpstreamSource } from "@/types";
import { NextResponse } from "next/server";

export function cachedJsonResponse(data: unknown, { status, upstream }: TCacheInfo): NextResponse {
  const headers = new Headers({ [CACHE_STATUS_HEADER]: status });
  if (upstream) {
    const duration = upstream.durationMs.toFixed(SERVER_TIMING_DECIMALS);
    headers.set(SERVER_TIMING_HEADER, `${upstream.source};dur=${duration}`);
  }
  return NextResponse.json(data, { headers });
}

export async function timeUpstream<T>(
  source: TUpstreamSource,
  call: () => Promise<T>,
): Promise<TTimedUpstream<T>> {
  const start = performance.now();
  const result = await call();
  return { result, timing: { source, durationMs: performance.now() - start } };
}
