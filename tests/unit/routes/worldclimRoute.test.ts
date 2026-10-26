import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/libs/Logger", () => ({ logger: { info: vi.fn(), error: vi.fn() } }));
vi.mock("@/libs/redis/client", () => ({
  RedisClient: { get: vi.fn(), set: vi.fn(), incrementCounter: vi.fn() },
}));
vi.mock("@/libs/redis", async (importOriginal) => importOriginal());
vi.mock("@/libs/Env", () => ({ env: { WORLDCLIM_API_KEY: "test-key" } }));

import { GET } from "@/app/api/worldclim/resource/route";
import { API_ERRORS } from "@/constants";
import { REDIS_STRATEGIES } from "@/libs/redis";
import { RedisClient } from "@/libs/redis/client";
import { NextRequest } from "next/server";

function makeRequest(searchParams: string): NextRequest {
  return new NextRequest(`http://localhost:3000/api/worldclim/resource?${searchParams}`);
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
  vi.mocked(RedisClient.incrementCounter).mockResolvedValue(1);
});

describe("GET /api/worldclim/resource — cache hit", () => {
  it("returns cached data without calling the WorldClim API", async () => {
    const cached = { result: "cached-worldclim-data" };
    vi.mocked(RedisClient.get).mockResolvedValue(cached);
    const fetchMock = stubFetch({});

    const res = await GET(makeRequest("id=Cell&iri=http%3A%2F%2Fexample.com%2FCell"));
    expect(await res.json()).toEqual(cached);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(RedisClient.set).not.toHaveBeenCalled();
  });
});

describe("GET /api/worldclim/resource — cache miss", () => {
  it("fetches from WorldClim API and caches the response", async () => {
    vi.mocked(RedisClient.get).mockResolvedValue(null);
    const apiData = { result: "worldclim-api-data" };
    const fetchMock = stubFetch(apiData);

    const res = await GET(makeRequest("id=Cell&iri=http%3A%2F%2Fexample.com%2FCell"));
    expect(await res.json()).toEqual(apiData);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(RedisClient.set).toHaveBeenCalled();
  });

  it("includes Authorization Bearer header with WORLDCLIM_API_KEY", async () => {
    vi.mocked(RedisClient.get).mockResolvedValue(null);
    const fetchMock = stubFetch({ result: "data" });

    await GET(makeRequest("id=Cell"));
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("scrapi.gsic.uva.es"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer test-key" }),
      }),
    );
  });

  it("builds the WorldClim URL from the incoming search params", async () => {
    vi.mocked(RedisClient.get).mockResolvedValue(null);
    const fetchMock = stubFetch({});

    await GET(makeRequest("id=Cell&iri=test-iri"));
    const calledUrl: string = fetchMock.mock.calls[0][0];
    expect(calledUrl).toContain("scrapi.gsic.uva.es");
    expect(calledUrl).toContain("id=Cell");
    expect(calledUrl).toContain("iri=test-iri");
  });

  it("uses regular ttl when counter is below popularThreshold", async () => {
    vi.mocked(RedisClient.get).mockResolvedValue(null);
    vi.mocked(RedisClient.incrementCounter).mockResolvedValue(1);
    stubFetch({ result: "data" });

    await GET(makeRequest("id=Cell"));
    expect(RedisClient.set).toHaveBeenCalledWith(
      expect.any(String),
      expect.anything(),
      REDIS_STRATEGIES.worldclimResource.ttl,
    );
  });
});

describe("GET /api/worldclim/resource — popular resource", () => {
  it("uses popularTtl when counter reaches popularThreshold", async () => {
    vi.mocked(RedisClient.get).mockResolvedValue(null);
    vi.mocked(RedisClient.incrementCounter).mockResolvedValue(
      REDIS_STRATEGIES.worldclimResource.popularThreshold,
    );
    stubFetch({ result: "popular-data" });

    await GET(makeRequest("id=Cell&iri=popular"));
    expect(RedisClient.set).toHaveBeenCalledWith(
      expect.any(String),
      expect.anything(),
      REDIS_STRATEGIES.worldclimResource.popularTtl,
    );
  });
});

describe("GET /api/worldclim/resource — upstream failure", () => {
  beforeEach(() => vi.mocked(RedisClient.get).mockResolvedValue(null));

  it.each([400, 401, 404, 500, 503])(
    "answers 502 and caches nothing when WorldClim responds %i",
    async (status) => {
      stubFetch({ error: "upstream says no" }, status);

      const res = await GET(makeRequest("id=Cell"));
      expect(res.status).toBe(API_ERRORS.WORLDCLIM_UNAVAILABLE.status);
      expect(await res.json()).toEqual({ error: API_ERRORS.WORLDCLIM_UNAVAILABLE.message });
      expect(RedisClient.set).not.toHaveBeenCalled();
      expect(RedisClient.incrementCounter).not.toHaveBeenCalled();
    },
  );

  it("answers 502 and caches nothing when the request itself fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    const res = await GET(makeRequest("id=Cell"));
    expect(res.status).toBe(API_ERRORS.WORLDCLIM_UNAVAILABLE.status);
    expect(RedisClient.set).not.toHaveBeenCalled();
  });

  it("answers 502 and caches nothing when the body is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new SyntaxError("Unexpected token <")),
      }),
    );

    const res = await GET(makeRequest("id=Cell"));
    expect(res.status).toBe(API_ERRORS.WORLDCLIM_UNAVAILABLE.status);
    expect(RedisClient.set).not.toHaveBeenCalled();
  });
});
