import { z as zod } from "zod";

export const gaIdSchema = zod
  .string()
  .regex(/^(G-[A-Z0-9]+)?$/, "Expected a GA4 measurement ID like G-XXXXXXXXXX")
  .default("");
