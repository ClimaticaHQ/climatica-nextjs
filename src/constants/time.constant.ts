/**
 * Time constants both in milliseconds and seconds.
 *
 * Example usage:
 * ```typescript
 * import { TIME } from "@/constants";
 *
 * // Set default timeout in milliseconds for 5 minutes
 * setTimeout(() => {
 *   console.log("This will run after 5 minutes");
 * }, TIME.IN_MILLISECONDS.FIVE_MINUTES);
 *
 * // Set cache duration in seconds for 30 minutes
 * const cacheDuration = TIME.IN_SECONDS.THIRTY_MINUTES;
 * ```
 */
export namespace TIME {
  const SECOND_MS = 1000;
  const MINUTE_MS = 60 * SECOND_MS;
  const HOUR_MS = 60 * MINUTE_MS;

  export const IN_MILLISECONDS = {
    ONE_HUNDRED_MS: 100,

    SECOND: SECOND_MS,
    TEN_SECONDS: 10 * SECOND_MS,
    THIRTY_SECONDS: 30 * SECOND_MS,
    FIFTY_SECONDS: 50 * SECOND_MS,

    MINUTE: MINUTE_MS,
    TWO_MINUTES: 2 * MINUTE_MS,
    THREE_MINUTES: 3 * MINUTE_MS,
    FIVE_MINUTES: 5 * MINUTE_MS,
    TEN_MINUTES: 10 * MINUTE_MS,
    FIFTEEN_MINUTES: 15 * MINUTE_MS,
    THIRTY_MINUTES: 30 * MINUTE_MS,

    HOUR: HOUR_MS,
    TWO_HOURS: 2 * HOUR_MS,

    DAY: 24 * HOUR_MS,
    SEVEN_DAYS: 7 * 24 * HOUR_MS,
    THIRTY_DAYS: 30 * 24 * HOUR_MS,
  } as const;

  const SECOND_S = 1;
  const MINUTE_S = 60 * SECOND_S;
  const HOUR_S = 60 * MINUTE_S;

  export const IN_SECONDS = {
    MINUTE: MINUTE_S,
    FIFTEEN_MINUTES: 15 * MINUTE_S,
    THIRTY_MINUTES: 30 * MINUTE_S,

    HOUR: HOUR_S,

    DAY: 24 * HOUR_S,
    SEVEN_DAYS: 7 * 24 * HOUR_S,
    THIRTY_DAYS: 30 * 24 * HOUR_S,
  } as const;
}
