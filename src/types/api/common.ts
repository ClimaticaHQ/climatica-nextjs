import type { API_ERRORS, CACHE_STATUS, UPSTREAM_SOURCES } from "@/constants";

export type TApiError = (typeof API_ERRORS)[keyof typeof API_ERRORS];

/** An upstream JSON fetch: the body when the call succeeded, otherwise why it didn't */
export type TUpstreamResult = { ok: true; data: unknown } | { ok: false; reason: string };

export type TCacheStatus = (typeof CACHE_STATUS)[keyof typeof CACHE_STATUS];

export type TUpstreamSource = (typeof UPSTREAM_SOURCES)[keyof typeof UPSTREAM_SOURCES];

export type TUpstreamTiming = { source: TUpstreamSource; durationMs: number };

export type TTimedUpstream<T> = { result: T; timing: TUpstreamTiming };

/** What a data response says about its cache; upstream only when the route called it */
export type TCacheInfo = { status: TCacheStatus; upstream?: TUpstreamTiming };

/** A strategy's TTL, and the longer one it switches to once looked up popularThreshold times */
export type TPopularityTtl = { ttl: number; popularTtl: number; popularThreshold: number };

/** A cached value's key, the key counting its lookups, and its TTLs */
export type TPopularityEntry = TPopularityTtl & { key: string; counterKey: string };

/** Where a WorldClim query is cached, and whether an upstream answer may be stored there */
export type TWorldClimCacheEntry = TPopularityEntry & { canStore: (data: unknown) => boolean };
