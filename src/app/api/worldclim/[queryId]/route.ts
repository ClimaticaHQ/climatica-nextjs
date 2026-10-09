import { API_ERRORS, TIME, WORLDCLIM_UPSTREAM_BASE } from "@/constants";
import { logger } from "@/libs/Logger";
import { checkRateLimit } from "@/libs/redis";
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

  const result = await fetchWorldClimJson(url);
  if (!result.ok) {
    logger.error(`[WorldClim] query ${queryId} failed: ${result.reason}`);
    return apiErrorResponse(API_ERRORS.WORLDCLIM_UNAVAILABLE);
  }

  return NextResponse.json(result.data);
}
