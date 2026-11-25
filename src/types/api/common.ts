import type { API_ERRORS, CACHE_STATUS, UPSTREAM_SOURCES } from "@/constants";

export type TApiError = (typeof API_ERRORS)[keyof typeof API_ERRORS];

export type TUpstreamResult = { ok: true; data: unknown } | { ok: false; reason: string };

export type TCacheStatus = (typeof CACHE_STATUS)[keyof typeof CACHE_STATUS];

export type TUpstreamSource = (typeof UPSTREAM_SOURCES)[keyof typeof UPSTREAM_SOURCES];

export type TUpstreamTiming = { source: TUpstreamSource; durationMs: number };

export type TTimedUpstream<T> = { result: T; timing: TUpstreamTiming };

export type TCacheInfo = { status: TCacheStatus; upstream?: TUpstreamTiming };

export type TPopularityTtl = { ttl: number; popularTtl: number; popularThreshold: number };

export type TPopularityEntry = TPopularityTtl & { key: string; counterKey: string };

export type TWorldClimCacheEntry = TPopularityEntry & { canStore: (data: unknown) => boolean };
