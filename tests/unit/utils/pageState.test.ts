import { API_ERRORS, APP_TITLE, DEFAULT_ERROR_MESSAGE_KEY } from "@/constants";
import { EApiErrorCause, EDataStatus } from "@/enums";
import {
  buildDocumentTitle,
  getErrorCause,
  getErrorMessageKey,
  isDisplayablePlaceLabel,
  resolveDataState,
} from "@/utils";
import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";

function responseError(status: number) {
  return new AxiosError("Request failed", "ERR_BAD_RESPONSE", undefined, undefined, {
    status,
    statusText: "",
    data: { error: "upstream said no" },
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe("getErrorCause / getErrorMessageKey: what a failed request tells the reader", () => {
  it.each([
    [429, EApiErrorCause.TOO_MANY_REQUESTS, "errors.tooManyRequests"],
    [
      API_ERRORS.CITY_SEARCH_UNAVAILABLE.status,
      EApiErrorCause.SEARCH_UNAVAILABLE,
      "errors.searchUnavailable",
    ],
    [
      API_ERRORS.WORLDCLIM_UNAVAILABLE.status,
      EApiErrorCause.DATA_SOURCE_UNAVAILABLE,
      "errors.dataSourceUnavailable",
    ],
  ])("status %i → %s", (status, cause, key) => {
    expect(getErrorCause(responseError(status))).toBe(cause);
    expect(getErrorMessageKey(responseError(status))).toBe(key);
  });

  it("no response at all (network, timeout) is a connection problem", () => {
    const error = new AxiosError("Network Error", "ERR_NETWORK");
    expect(getErrorCause(error)).toBe(EApiErrorCause.CONNECTION);
    expect(getErrorMessageKey(error)).toBe("errors.connection");
  });

  it("anything else falls back to the caller's message — never the error's own text", () => {
    expect(getErrorMessageKey(responseError(500))).toBe(DEFAULT_ERROR_MESSAGE_KEY);
    expect(getErrorMessageKey(new Error("boom"), "errors.custom")).toBe("errors.custom");
    expect(getErrorCause("not an error")).toBe(EApiErrorCause.UNKNOWN);
  });
});

describe("resolveDataState", () => {
  const base = { isLoading: false, error: null, hasData: true, emptyMessages: ["No data"] };

  it("loading first, then an error, then empty, else ready", () => {
    expect(resolveDataState({ ...base, isLoading: true, error: new Error("x") }).status).toBe(
      EDataStatus.LOADING,
    );
    expect(resolveDataState({ ...base, error: new Error("x"), hasData: false })).toEqual({
      status: EDataStatus.ERROR,
      error: new Error("x"),
    });
    expect(resolveDataState({ ...base, hasData: false })).toEqual({
      status: EDataStatus.EMPTY,
      messages: ["No data"],
    });
    expect(resolveDataState(base)).toEqual({ status: EDataStatus.READY });
  });
});

describe("buildDocumentTitle", () => {
  it("the place and details once the place is known", () => {
    expect(
      buildDocumentTitle({
        pageTitle: "City Climate",
        places: [" Valladolid "],
        details: "Tmax 1970–2000",
      }),
    ).toBe(`Valladolid · Tmax 1970–2000 | ${APP_TITLE}`);
  });

  it("compared cities, without details", () => {
    expect(
      buildDocumentTitle({
        pageTitle: "Compare Cities",
        places: ["Valladolid", "Lviv"],
        details: null,
      }),
    ).toBe(`Valladolid vs Lviv | ${APP_TITLE}`);
  });

  it("the page's name while any place is a placeholder", () => {
    for (const place of ["", "url:valladolid", "Q8371"]) {
      expect(isDisplayablePlaceLabel(place)).toBe(false);
      expect(
        buildDocumentTitle({ pageTitle: "Compare Cities", places: ["Lviv", place], details: null }),
      ).toBe(`Compare Cities | ${APP_TITLE}`);
    }
  });
});
