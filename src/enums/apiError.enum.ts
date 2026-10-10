/** Why a request to the app's API failed — each cause has its translated message. */
export enum EApiErrorCause {
  TOO_MANY_REQUESTS = "tooManyRequests",
  SEARCH_UNAVAILABLE = "searchUnavailable",
  DATA_SOURCE_UNAVAILABLE = "dataSourceUnavailable",
  CONNECTION = "connection",
  UNKNOWN = "unknown",
}
