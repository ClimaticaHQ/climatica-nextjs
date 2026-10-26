import {
  API_ERROR_CAUSE_BY_STATUS,
  API_ERROR_MESSAGE_KEYS,
  DEFAULT_ERROR_MESSAGE_KEY,
} from "@/constants";
import { EApiErrorCause } from "@/enums";
import { isAxiosError } from "axios";

/** Why a request failed: the route's status, or no answer at all (network, timeout). */
export function getErrorCause(error: unknown): EApiErrorCause {
  if (!isAxiosError(error)) return EApiErrorCause.UNKNOWN;
  const status = error.response?.status;
  if (status === undefined) return EApiErrorCause.CONNECTION;
  return API_ERROR_CAUSE_BY_STATUS[status] ?? EApiErrorCause.UNKNOWN;
}

/** The translated message's key for an error — a reader never sees the error's own text. */
export function getErrorMessageKey(error: unknown, fallbackKey = DEFAULT_ERROR_MESSAGE_KEY) {
  return API_ERROR_MESSAGE_KEYS[getErrorCause(error)] ?? fallbackKey;
}
