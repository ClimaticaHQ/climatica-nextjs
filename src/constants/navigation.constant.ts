import { TIME } from "./time.constant";

// * a pending link navigation that never lands (aborted, errored) stops blocking URL writes
// * after this long
export const NAVIGATION_INTENT_TIMEOUT_MS = TIME.IN_MILLISECONDS.TEN_SECONDS;
