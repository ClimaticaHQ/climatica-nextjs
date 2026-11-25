import "server-only";

import type { TPopularityEntry } from "@/types";
import { RedisClient } from "./client";

/** every lookup counts, hit or miss; the counter lives for the base TTL */
export const PopularityCache = {
  /** the hit that reaches the threshold extends the entry in place, no refetch */
  async recordHit(entry: TPopularityEntry): Promise<void> {
    const count = await RedisClient.incrementCounter(entry.counterKey, entry.ttl);
    if (count === entry.popularThreshold) await RedisClient.expire(entry.key, entry.popularTtl);
  },

  async store(entry: TPopularityEntry, value: unknown): Promise<void> {
    const count = await RedisClient.incrementCounter(entry.counterKey, entry.ttl);
    const ttl = count >= entry.popularThreshold ? entry.popularTtl : entry.ttl;
    await RedisClient.set(entry.key, value, ttl);
  },
};
