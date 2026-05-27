import { createEnv } from "@t3-oss/env-nextjs";
import { z as zod } from "zod";

export const env = createEnv({
  server: {
    PORT: zod.string().default("3000"),
    NODE_ENV: zod.enum(["development", "production", "test"]).default("development"),
    WORLDCLIM_API_KEY: zod.string().min(1),
    REDIS_URL: zod.string().default("redis://localhost:6379"),
    SOLR_URL: zod.string().default("http://localhost:8983"),
  },
  client: {},
  runtimeEnv: {
    PORT: process.env["PORT"],
    NODE_ENV: process.env["NODE_ENV"],
    WORLDCLIM_API_KEY: process.env["WORLDCLIM_API_KEY"],
    REDIS_URL: process.env["REDIS_URL"],
    SOLR_URL: process.env["SOLR_URL"],
  },
});
