import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRedis = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  incr: vi.fn(),
  expire: vi.fn(),
  on: vi.fn(),
}));

vi.mock("ioredis", () => ({
  // Must use `function` (not arrow) so `new Redis()` properly returns mockRedis
  default: vi.fn(function () {
    return mockRedis;
  }),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/libs/Env", () => ({ env: { REDIS_URL: "redis://localhost:6379" } }));
vi.mock("@/libs/Logger", () => ({ logger: { info: vi.fn(), error: vi.fn() } }));

import { RedisClient } from "@/libs/redis/client";

beforeEach(() => {
  Reflect.set(RedisClient, "instance", undefined);
  vi.clearAllMocks();
});

describe("RedisClient.get", () => {
  it("returns parsed JSON value when key exists", async () => {
    mockRedis.get.mockResolvedValue('{"id":"1","label":"Rome"}');
    const result = await RedisClient.get<{ id: string; label: string }>("key");
    expect(result).toEqual({ id: "1", label: "Rome" });
  });

  it("returns null when key does not exist", async () => {
    mockRedis.get.mockResolvedValue(null);
    const result = await RedisClient.get("key");
    expect(result).toBeNull();
  });

  it("returns null and does not throw when get throws", async () => {
    mockRedis.get.mockRejectedValue(new Error("connection lost"));
    await expect(RedisClient.get("key")).resolves.toBeNull();
  });
});

describe("RedisClient.set", () => {
  it("calls redis.set with JSON-stringified value and EX ttl", async () => {
    mockRedis.set.mockResolvedValue("OK");
    await RedisClient.set("key", { id: "1" }, 3600);
    expect(mockRedis.set).toHaveBeenCalledWith("key", '{"id":"1"}', "EX", 3600);
  });

  it("does not throw when set fails", async () => {
    mockRedis.set.mockRejectedValue(new Error("write error"));
    await expect(RedisClient.set("key", { id: "1" }, 3600)).resolves.toBeUndefined();
  });
});

describe("RedisClient.del", () => {
  it("calls redis.del with the correct key", async () => {
    mockRedis.del.mockResolvedValue(1);
    await RedisClient.del("some-key");
    expect(mockRedis.del).toHaveBeenCalledWith("some-key");
  });

  it("does not throw when del fails", async () => {
    mockRedis.del.mockRejectedValue(new Error("del error"));
    await expect(RedisClient.del("some-key")).resolves.toBeUndefined();
  });
});

describe("RedisClient.incrementCounter", () => {
  it("calls expire when incr returns 1 (first increment)", async () => {
    mockRedis.incr.mockResolvedValue(1);
    mockRedis.expire.mockResolvedValue(1);
    const result = await RedisClient.incrementCounter("counter-key", 86400);
    expect(mockRedis.expire).toHaveBeenCalledWith("counter-key", 86400);
    expect(result).toBe(1);
  });

  it("does not call expire when incr returns > 1 (subsequent increments)", async () => {
    mockRedis.incr.mockResolvedValue(2);
    const result = await RedisClient.incrementCounter("counter-key", 86400);
    expect(mockRedis.expire).not.toHaveBeenCalled();
    expect(result).toBe(2);
  });

  it("returns 0 and does not throw when incr fails", async () => {
    mockRedis.incr.mockRejectedValue(new Error("incr error"));
    await expect(RedisClient.incrementCounter("counter-key", 86400)).resolves.toBe(0);
  });
});
