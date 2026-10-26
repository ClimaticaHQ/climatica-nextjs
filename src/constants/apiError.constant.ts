import { EApiErrorCause } from "@/enums";
import { API_ERRORS } from "./api";

export const TOO_MANY_REQUESTS_STATUS = 429;

/** The status an /api route answers with, read as its cause. */
export const API_ERROR_CAUSE_BY_STATUS: Readonly<Record<number, EApiErrorCause>> = {
  [TOO_MANY_REQUESTS_STATUS]: EApiErrorCause.TOO_MANY_REQUESTS,
  [API_ERRORS.CITY_SEARCH_UNAVAILABLE.status]: EApiErrorCause.SEARCH_UNAVAILABLE,
  [API_ERRORS.WORLDCLIM_UNAVAILABLE.status]: EApiErrorCause.DATA_SOURCE_UNAVAILABLE,
};

/** Each cause's message; UNKNOWN uses the caller's own (e.g. errors.fetchClimateData). */
export const API_ERROR_MESSAGE_KEYS = {
  [EApiErrorCause.TOO_MANY_REQUESTS]: "errors.tooManyRequests",
  [EApiErrorCause.SEARCH_UNAVAILABLE]: "errors.searchUnavailable",
  [EApiErrorCause.DATA_SOURCE_UNAVAILABLE]: "errors.dataSourceUnavailable",
  [EApiErrorCause.CONNECTION]: "errors.connection",
  [EApiErrorCause.UNKNOWN]: null,
} as const satisfies Record<EApiErrorCause, string | null>;

export const DEFAULT_ERROR_MESSAGE_KEY = "errors.fetchClimateData";
