import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/libs/Logger", () => ({ logger: { info: vi.fn(), error: vi.fn() } }));
vi.mock("@/libs/redis/client", () => ({
  RedisClient: { get: vi.fn(), set: vi.fn(), incrementCounter: vi.fn() },
}));
vi.mock("@/libs/Env", () => ({ env: { WORLDCLIM_API_KEY: "test-key" } }));

import { GET } from "@/app/api/worldclim/[queryId]/route";
import { API_ERRORS } from "@/constants";
import { NextRequest } from "next/server";

function callRoute(queryId: string, searchParams: string) {
  const request = new NextRequest(`http://localhost:3000/api/worldclim/${queryId}?${searchParams}`);
  return GET(request, { params: Promise.resolve({ queryId }) });
}

function stubFetch(body: unknown, status = 200): ReturnType<typeof vi.fn> {
  const mock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("GET /api/worldclim/[queryId] — success", () => {
  it("passes the WorldClim body through with status 200", async () => {
    const body = { results: { bindings: [{ value: 1 }] } };
    stubFetch(body);

    const res = await callRoute("pixelValue", "lat=1&lng=2");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(body);
  });

  it("calls the query endpoint with the id, the search params and the server key", async () => {
    const fetchMock = stubFetch({});

    await callRoute("pixelValue", "lat=1&lng=2");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("scrapi.gsic.uva.es/apis/worldclim/query?id=pixelValue&lat=1&lng=2");
    expect(init).toEqual(
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer test-key" }),
      }),
    );
  });
});

describe("GET /api/worldclim/[queryId] — upstream failure", () => {
  it.each([400, 401, 500, 503])("answers 502 when WorldClim responds %i", async (status) => {
    stubFetch({ error: "upstream says no" }, status);

    const res = await callRoute("pixelValue", "lat=1&lng=2");
    expect(res.status).toBe(API_ERRORS.WORLDCLIM_UNAVAILABLE.status);
    expect(await res.json()).toEqual({ error: API_ERRORS.WORLDCLIM_UNAVAILABLE.message });
  });

  it("answers 502 when the request itself fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    const res = await callRoute("pixelValue", "lat=1&lng=2");
    expect(res.status).toBe(API_ERRORS.WORLDCLIM_UNAVAILABLE.status);
  });

  it("answers 502 when the body is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new SyntaxError("Unexpected token <")),
      }),
    );

    const res = await callRoute("pixelValue", "lat=1&lng=2");
    expect(res.status).toBe(API_ERRORS.WORLDCLIM_UNAVAILABLE.status);
  });
});
