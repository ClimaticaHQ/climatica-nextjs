import { gaIdSchema } from "@/validators/env.validator";
import { describe, expect, it } from "vitest";

describe("NEXT_PUBLIC_GA_ID", () => {
  it.each(["", "G-B9TR3R4SYP", "G-E2ETEST000"])("accepts %j", (value) => {
    expect(gaIdSchema.safeParse(value).success).toBe(true);
  });

  it("is empty when unset", () => {
    expect(gaIdSchema.parse(undefined)).toBe("");
  });

  it.each([
    "UA-12345-1",
    "G-",
    "g-b9tr3r4syp",
    "G-B9TR3R4SYP ",
    "GTM-ABC123",
    "G-ABC_123",
    "B9TR3R4SYP",
  ])("rejects %j", (value) => {
    expect(gaIdSchema.safeParse(value).success).toBe(false);
  });
});
