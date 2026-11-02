import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/libs/redis/client", () => ({
  RedisClient: { set: vi.fn(), expire: vi.fn(), incrementCounter: vi.fn() },
}));

import { PopularityCache } from "@/libs/redis/popularity";
import { RedisClient } from "@/libs/redis/client";

const entry = {
  key: "k",
  counterKey: "k-counter",
  ttl: 100,
  popularTtl: 1000,
  popularThreshold: 3,
};

beforeEach(() => vi.clearAllMocks());

describe("PopularityCache.recordHit", () => {
  it("counts the hit with the base TTL as the counter's window", async () => {
    vi.mocked(RedisClient.incrementCounter).mockResolvedValue(1);
    await PopularityCache.recordHit(entry);
    expect(RedisClient.incrementCounter).toHaveBeenCalledWith("k-counter", 100);
    expect(RedisClient.expire).not.toHaveBeenCalled();
  });

  it("extends the entry to the popular TTL on the hit that reaches the threshold", async () => {
    vi.mocked(RedisClient.incrementCounter).mockResolvedValue(3);
    await PopularityCache.recordHit(entry);
    expect(RedisClient.expire).toHaveBeenCalledWith("k", 1000);
    expect(RedisClient.set).not.toHaveBeenCalled();
  });

  it("extends only once per counter window", async () => {
    vi.mocked(RedisClient.incrementCounter).mockResolvedValue(4);
    await PopularityCache.recordHit(entry);
    expect(RedisClient.expire).not.toHaveBeenCalled();
  });

  it("does nothing more when Redis can't count (counter 0)", async () => {
    vi.mocked(RedisClient.incrementCounter).mockResolvedValue(0);
    await PopularityCache.recordHit(entry);
    expect(RedisClient.expire).not.toHaveBeenCalled();
  });
});

describe("PopularityCache.store", () => {
  it("stores with the base TTL below the threshold", async () => {
    vi.mocked(RedisClient.incrementCounter).mockResolvedValue(1);
    await PopularityCache.store(entry, { a: 1 });
    expect(RedisClient.set).toHaveBeenCalledWith("k", { a: 1 }, 100);
  });

  it("stores with the popular TTL once popular", async () => {
    vi.mocked(RedisClient.incrementCounter).mockResolvedValue(5);
    await PopularityCache.store(entry, { a: 1 });
    expect(RedisClient.set).toHaveBeenCalledWith("k", { a: 1 }, 1000);
  });
});
