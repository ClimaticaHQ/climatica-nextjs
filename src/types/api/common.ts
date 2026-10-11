import type { API_ERRORS } from "@/constants";

export type TApiError = (typeof API_ERRORS)[keyof typeof API_ERRORS];

/** An upstream JSON fetch: the body when the call succeeded, otherwise why it didn't */
export type TUpstreamResult = { ok: true; data: unknown } | { ok: false; reason: string };
