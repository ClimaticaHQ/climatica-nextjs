import type { TUrlSchema } from "@/types";
import { parseUrlState, serializeUrlState } from "@/utils/urlParams.util";
import { describe, expect, it } from "vitest";

type TState = { a: string; b: number };

const SCHEMA: TUrlSchema<TState> = {
  a: {
    serialize: (value, params) => params.set("a", value),
    parse: (params) => params.get("a") ?? undefined,
  },
  b: {
    serialize: (value, params) => params.set("b", String(value)),
    parse: (params) => {
      const raw = params.get("b");
      return raw !== null ? Number(raw) : undefined;
    },
  },
};

describe("serializeUrlState / parseUrlState", () => {
  it("round-trips every field in the schema", () => {
    const state: TState = { a: "hello", b: 42 };
    const params = serializeUrlState(SCHEMA, state);
    expect(parseUrlState(SCHEMA, params)).toEqual(state);
  });

  it("serializes each field once, in schema key order", () => {
    const params = serializeUrlState(SCHEMA, { a: "x", b: 1 });
    expect(params.toString()).toBe("a=x&b=1");
  });

  it("omits a key from the parsed result when its field returns undefined", () => {
    const params = new URLSearchParams();
    params.set("a", "only-a");
    expect(parseUrlState(SCHEMA, params)).toEqual({ a: "only-a" });
  });
});
