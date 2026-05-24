import { TIME } from "@/constants";
import Redis from "ioredis";
import env from "../Env";
import { logger } from "../Logger";

export class RedisClient {
  private static instance: Redis;

  private constructor() {}

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      const redisUrl = env.REDIS_URL;

      RedisClient.instance = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          if (times >= 3) {
            logger.error("[Redis] Max retries reached");
            return null;
          }

          // * exponential backoff, e.g., 100ms, 200ms, 400ms
          return Math.pow(2, times) * TIME.IN_MILLISECONDS.ONE_HUNDRED_MS;
        },
        reconnectOnError(error) {
          logger.error(`[Redis] Connection error: ${error.message}`);
          return true;
        },
        lazyConnect: true,
        enableOfflineQueue: true,
      });

      RedisClient.instance.on("connect", () => {
        logger.info("[Redis] Connected");
      });

      RedisClient.instance.on("error", (error) => {
        logger.error(`[Redis] Error: ${error.message}`);
      });
    }

    return RedisClient.instance;
  }

  public static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await RedisClient.getInstance().get(key);

      if (!cached) return null;

      return JSON.parse(cached) as T;
    } catch (error: any) {
      logger.error(`[Redis] GET error for key "${key}": ${error.message}`);
      return null;
    }
  }

  public static async set<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
      await RedisClient.getInstance().set(key, JSON.stringify(value), "EX", ttl);
    } catch (error: any) {
      logger.error(`[Redis] SET error for key "${key}": ${error.message}`);
    }
  }

  public static async del(key: string): Promise<void> {
    try {
      await RedisClient.getInstance().del(key);
    } catch (error: any) {
      logger.error(`[Redis] DEL error for key "${key}": ${error.message}`);
    }
  }
}
