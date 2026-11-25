import { z as zod } from "zod";

/** NEXT_PUBLIC_GA_ID: empty (no analytics: local dev, tests, CI) or a GA4 measurement ID. */
export const gaIdSchema = zod
  .string()
  .regex(/^(G-[A-Z0-9]+)?$/, "Expected a GA4 measurement ID like G-XXXXXXXXXX")
  .default("");
