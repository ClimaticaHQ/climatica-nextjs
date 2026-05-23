import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_BASE_BACKEND_URL: z.string().default("http://localhost:4000"),
  NEXT_PUBLIC_BASE_API_PREFIX: z.string().default("/api"),
});

const serverSchema = z.object({
  WORLDCLIM_API_KEY: z.string().default(""),
  UPSTASH_REDIS_REST_URL: z.string().default(""),
  UPSTASH_REDIS_REST_TOKEN: z.string().default(""),
});

const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_BASE_BACKEND_URL: process.env["NEXT_PUBLIC_BASE_BACKEND_URL"],
  NEXT_PUBLIC_BASE_API_PREFIX: process.env["NEXT_PUBLIC_BASE_API_PREFIX"],
});

const serverEnv = serverSchema.parse({
  WORLDCLIM_API_KEY: process.env["WORLDCLIM_API_KEY"],
  UPSTASH_REDIS_REST_URL: process.env["UPSTASH_REDIS_REST_URL"],
  UPSTASH_REDIS_REST_TOKEN: process.env["UPSTASH_REDIS_REST_TOKEN"],
});

export const env = {
  BASE_BACKEND_URL: clientEnv.NEXT_PUBLIC_BASE_BACKEND_URL,
  BASE_API_PREFIX: clientEnv.NEXT_PUBLIC_BASE_API_PREFIX,
  WORLDCLIM_API_KEY: serverEnv.WORLDCLIM_API_KEY,
  UPSTASH_REDIS_REST_URL: serverEnv.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: serverEnv.UPSTASH_REDIS_REST_TOKEN,
};

export default env;
