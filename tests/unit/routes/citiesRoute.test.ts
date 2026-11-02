import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/libs/Logger", () => ({ logger: { info: vi.fn(), error: vi.fn() } }));
vi.mock("@/libs/redis/client", () => ({
  RedisClient: { get: vi.fn(), set: vi.fn(), expire: vi.fn(), incrementCounter: vi.fn() },
}));
vi.mock("@/libs/redis", async (importOriginal) => importOriginal());
vi.mock("@/libs/services", () => ({
  SolrService: { searchCities: vi.fn(), findNearestCity: vi.fn() },
}));
vi.mock("@/libs/Env", () => ({
  env: {
    WORLDCLIM_API_KEY: "test-key",
    REDIS_URL: "redis://localhost:6379",
    SOLR_URL: "http://localhost:8983",
    PORT: "3000",
    NODE_ENV: "test",
  },
}));

import { GET } from "@/app/api/cities/route";
import { API_ERRORS } from "@/constants";
import { REDIS_STRATEGIES } from "@/libs/redis";
import { RedisClient } from "@/libs/redis/client";
import { SolrService } from "@/libs/services";
import type { TCity } from "@/types";
import { NextRequest } from "next/server";

function makeRequest(q: string, lang = "en"): NextRequest {
  return new NextRequest(
    `http://localhost:3000/api/cities?q=${encodeURIComponent(q)}&lang=${lang}`,
  );
}

const mockCity: TCity = {
  id: "3169070",
  label: "Rome",
  description: "Capital city · Italy",
  lat: 41.8919,
  lng: 12.5113,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(RedisClient.incrementCounter).mockResolvedValue(1);
});

describe("GET /api/cities — empty queries", () => {
  it("returns [] for empty query without any cache or Solr calls", async () => {
    const res = await GET(makeRequest(""));
    expect(await res.json()).toEqual([]);
    expect(res.headers.get("X-Cache")).toBe("BYPASS");
    expect(res.headers.get("Server-Timing")).toBeNull();
    expect(RedisClient.get).not.toHaveBeenCalled();
  });

  it("returns [] for single-char query", async () => {
    const res = await GET(makeRequest("a"));
    expect(await res.json()).toEqual([]);
    expect(SolrService.searchCities).not.toHaveBeenCalled();
  });
});

describe("GET /api/cities — text search cache hit", () => {
  it("returns cached results without calling Solr or writing to cache", async () => {
    vi.mocked(RedisClient.get).mockResolvedValue([mockCity]);

    const res = await GET(makeRequest("rome"));

    expect(await res.json()).toEqual([mockCity]);
    expect(res.headers.get("X-Cache")).toBe("HIT");
    expect(res.headers.get("Server-Timing")).toBeNull();
    expect(SolrService.searchCities).not.toHaveBeenCalled();
    expect(RedisClient.set).not.toHaveBeenCalled();
  });
});

describe("GET /api/cities — popularity on a hit", () => {
  it("counts a hit and extends the entry in place when it becomes popular", async () => {
    vi.mocked(RedisClient.get).mockResolvedValue([mockCity]);
    vi.mocked(RedisClient.incrementCounter).mockResolvedValue(
      REDIS_STRATEGIES.citySearch.popularThreshold,
    );

    await GET(makeRequest("rome"));

    expect(RedisClient.incrementCounter).toHaveBeenCalledWith(
      "city-search-counter:en:rome",
      REDIS_STRATEGIES.citySearch.ttl,
    );
    expect(RedisClient.expire).toHaveBeenCalledWith(
      "city-search:en:rome",
      REDIS_STRATEGIES.citySearch.popularTtl,
    );
    expect(SolrService.searchCities).not.toHaveBeenCalled();
  });

  it("doesn't count a hit on a short query", async () => {
    vi.mocked(RedisClient.get).mockResolvedValue([mockCity]);
    await GET(makeRequest("lo"));
    expect(RedisClient.incrementCounter).not.toHaveBeenCalled();
  });
});

describe("GET /api/cities — text search cache miss", () => {
  it("calls Solr and caches the results", async () => {
    vi.mocked(RedisClient.get).mockResolvedValue(null);
    vi.mocked(SolrService.searchCities).mockResolvedValue([mockCity]);

    const res = await GET(makeRequest("rome"));

    expect(await res.json()).toEqual([mockCity]);
    expect(res.headers.get("X-Cache")).toBe("MISS");
    expect(res.headers.get("Server-Timing")).toMatch(/^solr;dur=\d+\.\d$/);
    expect(SolrService.searchCities).toHaveBeenCalledWith("rome", "en");
    expect(RedisClient.set).toHaveBeenCalled();
  });

  it("does not cache empty Solr results", async () => {
    vi.mocked(RedisClient.get).mockResolvedValue(null);
    vi.mocked(SolrService.searchCities).mockResolvedValue([]);

    await GET(makeRequest("xyzzy"));

    expect(RedisClient.set).not.toHaveBeenCalled();
  });
});

describe("GET /api/cities — short query TTL", () => {
  it("uses shortTtl for queries with fewer than 4 chars", async () => {
    vi.mocked(RedisClient.get).mockResolvedValue(null);
    vi.mocked(SolrService.searchCities).mockResolvedValue([mockCity]);

    await GET(makeRequest("lo"));

    expect(RedisClient.set).toHaveBeenCalledWith(
      expect.any(String),
      [mockCity],
      REDIS_STRATEGIES.citySearch.shortTtl,
    );
    expect(RedisClient.incrementCounter).not.toHaveBeenCalled();
  });
});

describe("GET /api/cities — popular query TTL", () => {
  it("uses popularTtl when counter reaches popularThreshold", async () => {
    vi.mocked(RedisClient.get).mockResolvedValue(null);
    vi.mocked(SolrService.searchCities).mockResolvedValue([mockCity]);
    vi.mocked(RedisClient.incrementCounter).mockResolvedValue(
      REDIS_STRATEGIES.citySearch.popularThreshold,
    );

    await GET(makeRequest("paris"));

    expect(RedisClient.set).toHaveBeenCalledWith(
      expect.any(String),
      [mockCity],
      REDIS_STRATEGIES.citySearch.popularTtl,
    );
  });

  it("uses regular ttl when counter is below popularThreshold", async () => {
    vi.mocked(RedisClient.get).mockResolvedValue(null);
    vi.mocked(SolrService.searchCities).mockResolvedValue([mockCity]);
    vi.mocked(RedisClient.incrementCounter).mockResolvedValue(1);

    await GET(makeRequest("paris"));

    expect(RedisClient.set).toHaveBeenCalledWith(
      expect.any(String),
      [mockCity],
      REDIS_STRATEGIES.citySearch.ttl,
    );
  });
});

describe("GET /api/cities — coordinate queries", () => {
  it("looks up the nearest place, not a text search, for coordinate input", async () => {
    vi.mocked(RedisClient.get).mockResolvedValue(null);
    vi.mocked(SolrService.findNearestCity).mockResolvedValue(mockCity);

    const res = await GET(makeRequest("48.8566,2.3522"));

    expect(await res.json()).toEqual([mockCity]);
    expect(res.headers.get("X-Cache")).toBe("MISS");
    expect(res.headers.get("Server-Timing")).toMatch(/^solr;dur=\d+\.\d$/);
    expect(SolrService.findNearestCity).toHaveBeenCalledWith({
      lat: 48.8566,
      lng: 2.3522,
      lang: "en",
    });
    expect(SolrService.searchCities).not.toHaveBeenCalled();
  });

  it("caches coordinate result with nearestCity TTL", async () => {
    vi.mocked(RedisClient.get).mockResolvedValue(null);
    vi.mocked(SolrService.findNearestCity).mockResolvedValue(mockCity);

    await GET(makeRequest("48.8566,2.3522"));

    expect(RedisClient.set).toHaveBeenCalledWith(
      expect.any(String),
      [mockCity],
      REDIS_STRATEGIES.nearestCity.ttl,
    );
  });

  it("returns the cached place for coordinates without asking Solr", async () => {
    vi.mocked(RedisClient.get).mockResolvedValue([mockCity]);

    const res = await GET(makeRequest("48.8566,2.3522"));

    expect(await res.json()).toEqual([mockCity]);
    expect(res.headers.get("X-Cache")).toBe("HIT");
    expect(SolrService.findNearestCity).not.toHaveBeenCalled();
  });

  it("returns [] and does not cache when no place is within the radius", async () => {
    vi.mocked(RedisClient.get).mockResolvedValue(null);
    vi.mocked(SolrService.findNearestCity).mockResolvedValue(null);

    const res = await GET(makeRequest("0,0"));

    expect(await res.json()).toEqual([]);
    expect(RedisClient.set).not.toHaveBeenCalled();
  });
});

describe("GET /api/cities — coordinate lookups by language", () => {
  beforeEach(() => {
    vi.mocked(RedisClient.get).mockResolvedValue(null);
    vi.mocked(SolrService.findNearestCity).mockResolvedValue(mockCity);
  });

  it("names the place in the interface language and caches per language", async () => {
    await GET(makeRequest("48.8566,2.3522", "uk"));

    expect(SolrService.findNearestCity).toHaveBeenCalledWith({
      lat: 48.8566,
      lng: 2.3522,
      lang: "uk",
    });
    expect(RedisClient.get).toHaveBeenCalledWith("nearest-city:uk:48.8566:2.3522");
    expect(RedisClient.set).toHaveBeenCalledWith(
      "nearest-city:uk:48.8566:2.3522",
      [mockCity],
      REDIS_STRATEGIES.nearestCity.ttl,
    );
  });

  it("falls back to English for an unsupported language", async () => {
    await GET(makeRequest("48.8566,2.3522", "zz"));
    expect(RedisClient.get).toHaveBeenCalledWith("nearest-city:en:48.8566:2.3522");
  });
});

describe("GET /api/cities — coordinate separators", () => {
  it.each(["48.8566,2.3522", "48.8566, 2.3522", "48.8566 2.3522", "-33.86 151.21"])(
    "reverse-geocodes %j",
    async (q) => {
      vi.mocked(RedisClient.get).mockResolvedValue(null);
      vi.mocked(SolrService.findNearestCity).mockResolvedValue(mockCity);

      await GET(makeRequest(q));

      const [lat, lng] = q.split(/[,\s]+/).map(Number);
      expect(SolrService.findNearestCity).toHaveBeenCalledWith({
        lat,
        lng,
        lang: "en",
      });
      expect(SolrService.searchCities).not.toHaveBeenCalled();
    },
  );
});

describe("GET /api/cities — upstream failure", () => {
  beforeEach(() => vi.mocked(RedisClient.get).mockResolvedValue(null));

  it("answers 503, not 200 [], and caches nothing when Solr fails", async () => {
    vi.mocked(SolrService.searchCities).mockRejectedValue(new Error("Solr down"));

    const res = await GET(makeRequest("rome"));

    expect(res.status).toBe(API_ERRORS.CITY_SEARCH_UNAVAILABLE.status);
    expect(await res.json()).toEqual({ error: API_ERRORS.CITY_SEARCH_UNAVAILABLE.message });
    expect(res.headers.get("X-Cache")).toBeNull();
    expect(res.headers.get("Server-Timing")).toBeNull();
    expect(RedisClient.set).not.toHaveBeenCalled();
    expect(RedisClient.incrementCounter).not.toHaveBeenCalled();
  });

  it("answers 502 and caches nothing when the nearest-place lookup fails", async () => {
    vi.mocked(SolrService.findNearestCity).mockRejectedValue(new Error("Solr down"));

    const res = await GET(makeRequest("48.8566,2.3522"));

    expect(res.status).toBe(API_ERRORS.REVERSE_GEOCODING_UNAVAILABLE.status);
    expect(RedisClient.set).not.toHaveBeenCalled();
  });
});
