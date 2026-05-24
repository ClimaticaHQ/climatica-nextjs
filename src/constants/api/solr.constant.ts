import { env } from "@/libs";

export const SOLR_CONFIG = {
  BASE_URL: env.SOLR_URL ?? "http://localhost:8983",
} as const;
