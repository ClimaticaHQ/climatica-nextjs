import type { API_ERRORS, RESULT_STATUSES } from "@/constants";

export type TResultStatus = (typeof RESULT_STATUSES)[keyof typeof RESULT_STATUSES];

export interface TApiResponse<T> {
  status: TResultStatus;
  message: string;
  data: T;
}

export type TApiError = (typeof API_ERRORS)[keyof typeof API_ERRORS];

/** An upstream JSON fetch: the body when the call succeeded, otherwise why it didn't */
export type TUpstreamResult = { ok: true; data: unknown } | { ok: false; reason: string };
