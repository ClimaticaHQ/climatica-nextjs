import "server-only";

import type { TPopularityEntry } from "@/types";
import { RedisClient } from "./client";

/**
 * Popular entries live longer. Every lookup counts, hit or miss; the counter lives for the base
 * TTL, so popularity is lookups within that window.
 */
export const PopularityCache = {
  /** A hit: counted; the hit that reaches the threshold extends the entry in place, no refetch */
  async recordHit(entry: TPopularityEntry): Promise<void> {
    const count = await RedisClient.incrementCounter(entry.counterKey, entry.ttl);
    if (count === entry.popularThreshold) await RedisClient.expire(entry.key, entry.popularTtl);
  },

  /** A miss that is stored: counted, and stored with the popular TTL once the key is popular */
  async store(entry: TPopularityEntry, value: unknown): Promise<void> {
    const count = await RedisClient.incrementCounter(entry.counterKey, entry.ttl);
    const ttl = count >= entry.popularThreshold ? entry.popularTtl : entry.ttl;
    await RedisClient.set(entry.key, value, ttl);
  },
};
